"use client";

import { useState, useRef, useCallback } from "react";
import { FileUp, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { parseCfdi } from "@/lib/cfdi-parser";
import type { CfdiData } from "@/lib/types";
import { CfdiTable } from "@/components/cfdi-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Home() {
  const [cfdiData, setCfdiData] = useState<CfdiData[] | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = useCallback(async (file: File) => {
    if (!file) return;
    if (file.type !== "text/xml" && !file.name.endsWith('.xml')) {
      const errorMsg = "Por favor, seleccione un archivo XML válido.";
      setError(errorMsg);
      toast({
        variant: "destructive",
        title: "Archivo no válido",
        description: errorMsg,
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setCfdiData(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const xmlString = e.target?.result as string;
      try {
        const data = parseCfdi(xmlString);
        setCfdiData(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Ocurrió un error desconocido.";
        setError(errorMessage);
        toast({
          variant: "destructive",
          title: "Error de procesamiento",
          description: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      const errorMessage = "No se pudo leer el archivo.";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error de lectura",
        description: errorMessage,
      });
      setIsLoading(false);
    };
    reader.readAsText(file);
  }, [toast]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFile(e.target.files[0]);
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const onClear = () => {
    setCfdiData(null);
    setFileName("");
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 bg-background text-foreground font-body">
      <div className="w-full max-w-7xl mx-auto flex flex-col items-center gap-8">
        <header className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold font-headline text-primary">
            CFDI Explorer
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Importe y explore sus archivos CFDI de nómina 4.0 con facilidad.
          </p>
        </header>

        <div className="w-full">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-4 p-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Procesando archivo...</p>
            </div>
          ) : cfdiData ? (
            <CfdiTable data={cfdiData} fileName={fileName} onClear={onClear} />
          ) : (
            <div className="w-full max-w-2xl mx-auto">
              <div
                className={cn(
                  "relative flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card p-12 text-center transition-colors duration-300 hover:border-primary/80 hover:bg-accent/10",
                  isDragging && "border-primary bg-accent/20"
                )}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <FileUp className="h-16 w-16 text-primary" />
                <h3 className="mt-4 text-2xl font-semibold">
                  Arrastre o seleccione un archivo
                </h3>
                <p className="mt-1 text-muted-foreground">
                  Suelte un archivo XML (CFDI de nómina) aquí
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xml,text/xml"
                  onChange={onFileChange}
                  className="sr-only"
                />
              </div>
              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
