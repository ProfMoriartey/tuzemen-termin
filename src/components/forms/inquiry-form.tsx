"use client";

import { useState, useTransition } from "react";
import { createInquiryAction } from "~/server/actions/inquiries";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

type Fabric = { id: string; name: string };
type Variant = { id: string; fabricId: string; colorName: string };

export function InquiryForm({
  fabrics,
  variants,
}: {
  fabrics: Fabric[];
  variants: Variant[];
}) {
  const [isPending, startTransition] = useTransition();
  const [selectedFabric, setSelectedFabric] = useState<string>("");

  const filteredVariants = variants.filter(
    (v) => v.fabricId === selectedFabric,
  );

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const formData = new FormData(formElement);

    startTransition(async () => {
      try {
        await createInquiryAction(formData);
        formElement.reset();
        setSelectedFabric("");
      } catch (error) {
        console.error(error);
      }
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto flex w-full max-w-md flex-col gap-4 rounded-lg border p-4 shadow-sm"
    >
      <label className="flex flex-col gap-1 text-sm font-medium">
        Kumaş
        <select
          className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          value={selectedFabric}
          onChange={(e) => setSelectedFabric(e.target.value)}
          required
        >
          <option value="" disabled>
            Kumaş seçin
          </option>
          {fabrics.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Renk
        <select
          name="variantId"
          className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!selectedFabric}
          required
        >
          <option value="" disabled>
            renk seçin
          </option>
          {filteredVariants.map((v) => (
            <option key={v.id} value={v.id}>
              {v.colorName}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Müşteri Adı
        <Input name="customerName" placeholder="Müşteri adını girin" required />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Miktar (MT)
        <Input
          type="number"
          name="quantity"
          min="1"
          placeholder="Metre cinsinden miktar"
          required
        />
      </label>

      <Button type="submit" disabled={isPending} className="mt-2 w-full">
        {isPending ? "Gönderiliyor..." : "Talep Gönder"}
      </Button>
    </form>
  );
}
