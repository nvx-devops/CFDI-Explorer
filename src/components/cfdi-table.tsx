"use client";

import type { CfdiData } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Download, FileSpreadsheet, XCircle } from "lucide-react";
import { exportToCSV, exportToXLSX } from "@/lib/export";
import { Badge } from "@/components/ui/badge";

interface CfdiTableProps {
  data: CfdiData[];
  fileName: string;
  onClear: () => void;
}

export function CfdiTable({ data, fileName, onClear }: CfdiTableProps) {
  const handleExportCSV = () => {
    exportToCSV(data, fileName.replace('.xml', ''));
  };

  const handleExportXLSX = () => {
    exportToXLSX(data, fileName.replace('.xml', ''));
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <CardTitle>{fileName}</CardTitle>
                <CardDescription>{data.length} registro(s) encontrado(s).</CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleExportCSV}>
                    <Download className="mr-2 h-4 w-4" />
                    CSV
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportXLSX}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    XLSX
                </Button>
                <Button variant="ghost" size="icon" onClick={onClear} aria-label="Limpiar datos">
                    <XCircle className="h-5 w-5" />
                    <span className="sr-only">Limpiar</span>
                </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[50vh] w-full border rounded-md">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead>Versión</TableHead>
                <TableHead>Folio Fiscal</TableHead>
                <TableHead>Serie</TableHead>
                <TableHead>Folio</TableHead>
                <TableHead>Fecha Inicial Pago</TableHead>
                <TableHead>Fecha Final Pago</TableHead>
                <TableHead>Días Pagados</TableHead>
                <TableHead>Fecha de Pago</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Clave SAT</TableHead>
                <TableHead>Clave Interna</TableHead>
                <TableHead>Concepto</TableHead>
                <TableHead className="text-right">Importe Gravado</TableHead>
                <TableHead className="text-right">Importe Exento</TableHead>
                <TableHead>Fecha de Emisión</TableHead>
                <TableHead>Fecha de Timbrado</TableHead>
                <TableHead>Estatus</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => (
                <TableRow key={`${item.folioFiscal}-${index}`}>
                  <TableCell className="whitespace-nowrap">{item.version}</TableCell>
                  <TableCell className="whitespace-nowrap">{item.folioFiscal}</TableCell>
                  <TableCell>{item.serie}</TableCell>
                  <TableCell>{item.folio}</TableCell>
                  <TableCell>{item.fechaInicialPago}</TableCell>
                  <TableCell>{item.fechaFinalPago}</TableCell>
                  <TableCell>{item.diasPagados}</TableCell>
                  <TableCell>{item.fechaPago}</TableCell>
                  <TableCell><Badge variant={item.tipo === 'Percepción' ? 'default' : 'secondary'}>{item.tipo}</Badge></TableCell>
                  <TableCell>{item.claveSat}</TableCell>
                  <TableCell>{item.claveInterna}</TableCell>
                  <TableCell className="max-w-xs truncate">{item.concepto}</TableCell>
                  <TableCell className="text-right">{item.importeGravado.toLocaleString('es-MX', {style:'currency', currency:'MXN'})}</TableCell>
                  <TableCell className="text-right">{item.importeExento.toLocaleString('es-MX', {style:'currency', currency:'MXN'})}</TableCell>
                  <TableCell className="whitespace-nowrap">{item.fechaEmision}</TableCell>
                  <TableCell className="whitespace-nowrap">{item.fechaTimbrado}</TableCell>
                  <TableCell><Badge variant="outline">{item.estatus}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
