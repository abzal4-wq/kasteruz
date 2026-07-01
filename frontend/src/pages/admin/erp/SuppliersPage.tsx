import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Package } from "lucide-react";
import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Supplier } from "@/types/database";

interface SupplierForm {
  name: string;
  phone: string;
  location: string;
  notes: string;
}

export default function SuppliersPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);

  const { register, handleSubmit, reset } = useForm<SupplierForm>();

  const { data: suppliers } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async (): Promise<Supplier[]> => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as Supplier[];
    },
  });

  const saveSupplier = useMutation({
    mutationFn: async (form: SupplierForm) => {
      if (editing) {
        await supabase
          .from("suppliers")
          .update({ ...form })
          .eq("id", editing.id);
      } else {
        await supabase.from("suppliers").insert({ ...form });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      setDialogOpen(false);
      setEditing(null);
      reset();
    },
  });

  function openNew() {
    setEditing(null);
    reset({ name: "", phone: "", location: "", notes: "" });
    setDialogOpen(true);
  }

  function openEdit(s: Supplier) {
    setEditing(s);
    reset({
      name: s.name,
      phone: s.phone ?? "",
      location: s.location ?? "",
      notes: s.notes ?? "",
    });
    setDialogOpen(true);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-light text-charcoal">
            Ta'minotchilar
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {suppliers?.length ?? 0} ta yetkazib beruvchi
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus className="mr-2 h-4 w-4" />
          Yangi
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {suppliers?.map((s) => (
          <div key={s.id} className="overflow-hidden rounded-ios border border-black/5 bg-white shadow-glass-sm p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center bg-cream-200">
                  <Package className="h-5 w-5 text-charcoal-400" />
                </div>
                <div>
                  <p className="font-medium text-charcoal">{s.name}</p>
                  {s.location && (
                    <p className="text-xs text-muted-foreground">{s.location}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => openEdit(s)}
                className="text-muted-foreground hover:text-gold"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>

            {s.phone && (
              <a
                href={`tel:${s.phone}`}
                className="mt-4 block text-sm text-gold hover:underline"
              >
                {s.phone}
              </a>
            )}
            {s.notes && (
              <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                {s.notes}
              </p>
            )}
            <div className="mt-3">
              <Badge variant={s.is_active ? "success" : "muted"}>
                {s.is_active ? "Aktiv" : "Nofaol"}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Ta'minotchini tahrirlash" : "Yangi ta'minotchi"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit((f) => saveSupplier.mutate(f))} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
                Nomi *
              </label>
              <Input {...register("name", { required: true })} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
                Telefon
              </label>
              <Input {...register("phone")} type="tel" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
                Manzil
              </label>
              <Input {...register("location")} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
                Izoh
              </label>
              <textarea
                {...register("notes")}
                rows={3}
                className="input-kaster resize-none"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Bekor
              </Button>
              <Button type="submit" disabled={saveSupplier.isPending}>
                {saveSupplier.isPending ? "Saqlanmoqda..." : "Saqlash"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
