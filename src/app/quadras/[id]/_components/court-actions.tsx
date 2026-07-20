"use client";

import { Copy, MapPin, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";

export interface CourtActionsProps {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export function CourtActions({ name, address, latitude, longitude }: CourtActionsProps) {
  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: name, text: `Confira ${name} no Saibro`, url });
      } catch {
        // usuário cancelou o compartilhamento — não é um erro a reportar
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    toast("Link copiado.");
  }

  async function handleCopyAddress() {
    await navigator.clipboard.writeText(address);
    toast("Endereço copiado.");
  }

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={handleCopyAddress}>
        <Copy className="size-3.5" aria-hidden />
        Copiar endereço
      </Button>
      <Button variant="outline" size="sm" asChild>
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
          <MapPin className="size-3.5" aria-hidden />
          Abrir no Google Maps
        </a>
      </Button>
      <Button variant="outline" size="sm" onClick={handleShare}>
        <Share2 className="size-3.5" aria-hidden />
        Compartilhar
      </Button>
    </div>
  );
}
