import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { XMLParser } from 'fast-xml-parser';

export async function POST(request: Request) {
    try {
        const { xmlContent } = await request.json();

        if (!xmlContent) {
            return NextResponse.json({ error: 'XML content missing' }, { status: 400 });
        }

        const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
        const jsonObj = parser.parse(xmlContent);

        // NFe Structure: nfeProc -> NFe -> infNFe -> det (Process NFe)
        // Or directly NFe -> infNFe
        // We need robust traversing

        const nfe = jsonObj.nfeProc?.NFe || jsonObj.NFe;
        if (!nfe) return NextResponse.json({ error: 'Formato inválido de NFe' }, { status: 400 });

        const infNFe = nfe.infNFe;
        const dets = Array.isArray(infNFe.det) ? infNFe.det : [infNFe.det];

        let processedCount = 0;

        const { cookies } = require("next/headers");
        const cookieStore = await cookies();
        const branchId = cookieStore.get("touti_branchId")?.value;

        if (!branchId) {
            return NextResponse.json({ error: 'Nenhuma filial selecionada para importação.' }, { status: 400 });
        }

        // Batch Processing Configuration
        const BATCH_SIZE = 50;

        // Helper to process a batch
        const processBatch = async (batch: any[]) => {
            await prisma.$transaction(async (tx) => {
                for (const det of batch) {
                    const prod = det.prod;

                    // Extract Data
                    const barcode = prod.cEAN !== "SEM GTIN" ? prod.cEAN : `INTERNAL-${prod.cProd}`;
                    const name = prod.xProd;
                    const ncm = prod.NCM;
                    const cest = prod.CEST;
                    const cfop = prod.CFOP;
                    const uCom = prod.uCom;
                    const qCom = Number(prod.qCom);
                    const vUnCom = Number(prod.vUnCom);

                    // Upsert Product
                    let product = await tx.product.findUnique({
                        where: { barcode: barcode as string }
                    });

                    if (!product) {
                        product = await tx.product.create({
                            data: {
                                name: name,
                                barcode: barcode,
                                price: vUnCom * 1.5,
                                costPrice: vUnCom,
                                ncm: ncm,
                                cest: cest,
                                cfop: cfop,
                                unit: uCom,
                                imageUrl: ""
                            }
                        });
                    } else {
                        await tx.product.update({
                            where: { id: product.id },
                            data: {
                                costPrice: vUnCom,
                                ncm: ncm,
                                cest: cest
                            }
                        });
                    }

                    // Update Stock for Branch
                    await tx.productStock.upsert({
                        where: {
                            productId_branchId: {
                                productId: product.id,
                                branchId: branchId
                            }
                        },
                        update: {
                            quantity: { increment: qCom }
                        },
                        create: {
                            productId: product.id,
                            branchId: branchId,
                            quantity: qCom,
                            minStock: 5 // Default
                        }
                    });

                    // Log Movement
                    await tx.stockMovement.create({
                        data: {
                            productId: product.id,
                            branchId: branchId,
                            type: "PURCHASE",
                            quantity: qCom,
                            reason: `Importação XML NFe`
                        }
                    });

                    processedCount++;
                }
            }, {
                maxWait: 5000, // 5s max wait for tx
                timeout: 10000 // 10s timeout per batch
            });
        };

        // Split into batches
        for (let i = 0; i < dets.length; i += BATCH_SIZE) {
            const batch = dets.slice(i, i + BATCH_SIZE);
            await processBatch(batch);
        }

        return NextResponse.json({ success: true, productsProcessed: processedCount });

    } catch (error: any) {
        console.error("XML Import Error:", error);
        return NextResponse.json({ error: 'Failed to process XML: ' + error.message }, { status: 500 });
    }
}
