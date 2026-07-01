import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice, formatDateShort } from "@/lib/utils";
import type { Expense } from "@/types/database";

const EXPENSE_CATEGORIES = [
  "Ijara",
  "Maosh",
  "Yetkazib berish",
  "Reklama",
  "Kommunal",
  "Ta'mirlash",
  "Boshqa",
];

interface ExpenseForm {
  category: string;
  amount: number;
  description: string;
  date: string;
}

export default function FinancePage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { register, handleSubmit, reset, setValue, watch } = useForm<ExpenseForm>({
    defaultValues: { date: new Date().toISOString().split("T")[0] },
  });
  const selectedCategory = watch("category");

  // Xarajatlar
  const { data: expenses } = useQuery({
    queryKey: ["expenses"],
    queryFn: async (): Promise<Expense[]> => {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .order("date", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as Expense[];
    },
  });

  // Moliyaviy xulosa
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["finance-summary"],
    queryFn: async () => {
      // Oxirgi 30 kun uchun
      const since = new Date();
      since.setDate(since.getDate() - 30);

      const [ordersRes, expensesRes] = await Promise.all([
        supabase
          .from("orders")
          .select("total, created_at")
          .eq("payment_status", "paid")
          .not("status", "in", '("cancelled","returned","refunded")')
          .gte("created_at", since.toISOString()),
        supabase
          .from("expenses")
          .select("amount")
          .gte("date", since.toISOString().split("T")[0]),
      ]);

      const revenue = (ordersRes.data ?? []).reduce((s, o) => s + o.total, 0);
      const expTotal = (expensesRes.data ?? []).reduce((s, e) => s + e.amount, 0);

      return { revenue, expenses: expTotal, profit: revenue - expTotal };
    },
  });

  const addExpense = useMutation({
    mutationFn: async (form: ExpenseForm) => {
      await supabase.from("expenses").insert({
        category: form.category,
        amount: Number(form.amount),
        description: form.description || null,
        date: form.date,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["finance-summary"] });
      setDialogOpen(false);
      reset();
    },
  });

  const summaryCards = [
    {
      label: "30 kunlik daromad",
      value: summary ? formatPrice(summary.revenue) : "—",
      icon: TrendingUp,
      positive: true,
    },
    {
      label: "30 kunlik xarajat",
      value: summary ? formatPrice(summary.expenses) : "—",
      icon: TrendingDown,
      positive: false,
    },
    {
      label: "Sof foyda",
      value: summary ? formatPrice(summary.profit) : "—",
      icon: DollarSign,
      positive: (summary?.profit ?? 0) >= 0,
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-light text-charcoal">Moliya</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Daromad, xarajat va sof foyda
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Xarajat qo'shish
        </Button>
      </div>

      {/* ─── Xulosa kartalari ─────────────────────────── */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {summaryCards.map((card) => (
          <div key={card.label} className="overflow-hidden rounded-ios border border-black/5 bg-white shadow-glass-sm p-5">
            <div className="flex items-center justify-between">
              <card.icon
                className={card.positive ? "h-5 w-5 text-green-600" : "h-5 w-5 text-destructive"}
              />
            </div>
            {summaryLoading ? (
              <Skeleton className="mt-3 h-7 w-28" />
            ) : (
              <p className="mt-3 font-serif text-xl font-medium">{card.value}</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">{card.label}</p>
          </div>
        ))}
      </div>

      {/* ─── Xarajatlar ro'yxati ──────────────────────── */}
      <div className="mt-8">
        <h2 className="mb-4 font-serif text-lg font-medium text-charcoal">
          So'nggi xarajatlar
        </h2>
        <div className="overflow-hidden rounded-ios border border-black/5 bg-white shadow-glass-sm">
          <table className="w-full text-sm">
            <thead className="bg-cream-100 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Sana</th>
                <th className="px-4 py-3 font-medium">Kategoriya</th>
                <th className="px-4 py-3 font-medium">Tavsif</th>
                <th className="px-4 py-3 text-right font-medium">Summa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {expenses?.map((exp) => (
                <tr key={exp.id} className="hover:bg-cream-50">
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDateShort(exp.date)}
                  </td>
                  <td className="px-4 py-3 font-medium text-charcoal">
                    {exp.category}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {exp.description ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-destructive">
                    −{formatPrice(exp.amount)}
                  </td>
                </tr>
              ))}
              {(!expenses || expenses.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                    Xarajatlar yo'q
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Xarajat qo'shish dialog ───────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Xarajat qo'shish</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={handleSubmit((f) => addExpense.mutate(f))}
            className="space-y-4"
          >
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
                Kategoriya *
              </label>
              <Select
                value={selectedCategory}
                onValueChange={(v) => setValue("category", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
                Summa (so'm) *
              </label>
              <Input
                type="number"
                min={0}
                {...register("amount", { required: true, valueAsNumber: true })}
                placeholder="100 000"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
                Tavsif
              </label>
              <Input {...register("description")} placeholder="Ixtiyoriy" />
            </div>

            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
                Sana *
              </label>
              <Input type="date" {...register("date", { required: true })} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Bekor
              </Button>
              <Button type="submit" disabled={addExpense.isPending}>
                {addExpense.isPending ? "Saqlanmoqda..." : "Saqlash"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
