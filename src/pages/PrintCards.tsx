import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Printer, Search } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { PrintableBadgeCard } from "@/components/PrintableBadgeCard";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Registration {
  id: string;
  name: string;
  surname: string;
  mobile_number: string;
  alternate_mobile_number: string | null;
  emergency_contact_number: string;
  aadhaar_number: string;
  address: string | null;
  age: number | null;
  hypertension: string | null;
  sugar: string | null;
  image_url: string | null;
  created_at: string;
}

function formatAadhaar(aadhaar: string) {
  return aadhaar.replace(/(\d{4})/g, "$1 ").trim();
}

function chunk<T>(items: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

export default function PrintCards() {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, navigate, user]);

  const { data: registrations, isLoading } = useQuery({
    queryKey: ["registrations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sangat_registrations")
        .select(
          "id,name,surname,mobile_number,alternate_mobile_number,emergency_contact_number,aadhaar_number,address,age,hypertension,sugar,image_url,created_at",
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as Registration[];
    },
    enabled: !!user && isAdmin,
  });

  const filteredRegistrations = useMemo(() => {
    const searchLower = searchTerm.trim().toLowerCase();
    if (!searchLower) return registrations ?? [];

    return (registrations ?? []).filter(
      (r) =>
        `${r.name} ${r.surname}`.toLowerCase().includes(searchLower) ||
        r.mobile_number.includes(searchTerm.trim()) ||
        r.aadhaar_number.includes(searchTerm.trim()),
    );
  }, [registrations, searchTerm]);

  const selectedRegistrations = useMemo(() => {
    const selected = selectedIds;
    return (registrations ?? []).filter((r) => selected.has(r.id));
  }, [registrations, selectedIds]);

  const pages = useMemo(() => chunk(selectedRegistrations, 8), [selectedRegistrations]);

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllFiltered = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const r of filteredRegistrations) next.add(r.id);
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const handlePrint = () => {
    window.print();
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="mx-auto max-w-md text-center animate-fade-in p-8">
          <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-full bg-destructive/10 mb-6">
            <span className="text-4xl">🔒</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-foreground mb-3">Access Restricted</h2>
          <p className="text-muted-foreground">You don't have admin privileges to print cards.</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <style>
        {`
@media print {
  body * { visibility: hidden; }
  #print-area, #print-area * { visibility: visible; }
  #print-area { position: absolute; left: 0; top: 0; width: 100%; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  @page { size: A4; margin: 0; }
}

.print-page {
  background: white;
  margin: 0 auto;
  padding: 8mm;
  width: 210mm;
  min-height: 297mm;
  box-sizing: border-box;
}

.print-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 5mm;
}

.badge-card {
  width: 95mm;
  height: 67mm;
  border: 2px solid #000;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
  font-family: "Nirmala UI", "Mangal", system-ui, -apple-system, "Segoe UI", Roboto, Arial, "Noto Sans Devanagari", sans-serif;
}
.badge-header {
  background: #dfead2;
  border-bottom: 2px solid #000;
  padding: 2mm;
  text-align: center;
  font-weight: 800;
  font-size: 12px;
}
.badge-header-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.badge-subheader {
  border-bottom: 2px solid #000;
  text-align: center;
  font-weight: 800;
  padding: 1mm;
  font-size: 12px;
}
.badge-body {
  display: grid;
  grid-template-columns: 28mm 1fr;
  height: calc(67mm - 18mm);
}
.badge-photo {
  border-right: 2px solid #000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1mm;
}
.badge-photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.badge-photo-placeholder {
  width: 100%;
  height: 100%;
  background: #f1f1f1;
}
.badge-details {
  display: grid;
  grid-template-rows: repeat(4, 1fr);
}
.badge-row {
  display: grid;
  grid-template-columns: 28mm 1fr;
  border-bottom: 2px solid #000;
  align-items: center;
  font-size: 12px;
  line-height: 1.1;
}
.badge-row:last-child {
  border-bottom: none;
}
.badge-label {
  border-right: 2px solid #000;
  padding: 1mm 1.5mm;
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.badge-value {
  padding: 1mm 1.5mm;
  overflow: hidden;
  text-overflow: ellipsis;
}
.badge-value-strong {
  font-weight: 800;
}
.badge-footer {
  background: #dfead2;
  border-top: 2px solid #000;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  padding: 1mm 2mm;
  font-weight: 800;
  font-size: 12px;
}
.badge-footer-left {
  text-align: left;
}
.badge-footer-right {
  text-align: right;
}
.badge-flags {
  position: absolute;
  top: 19mm;
  right: 2mm;
  display: flex;
  gap: 1mm;
}
.badge-flag {
  border: 2px solid #000;
  background: #fff7d6;
  padding: 0.5mm 1mm;
  font-size: 10px;
  font-weight: 900;
}

@media print {
  .print-page {
    padding: 8mm;
    margin: 0;
    page-break-after: always;
  }
}
`}
      </style>

      <div className="print:hidden">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-serif font-bold text-foreground">Print Cards</h2>
            <p className="text-sm text-muted-foreground">
              Select members and print multiple ID cards at once.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={selectAllFiltered} variant="outline">
              Select All (Filtered)
            </Button>
            <Button onClick={clearSelection} variant="outline" disabled={selectedIds.size === 0}>
              Clear
            </Button>
            <Button onClick={handlePrint} disabled={selectedIds.size === 0} className="gap-2">
              <Printer className="h-4 w-4" />
              Print Selected ({selectedIds.size})
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, mobile, or aadhaar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="rounded-xl border border-border/50 bg-card shadow-card overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              {searchTerm ? "No registrations found matching your search." : "No registrations yet."}
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {filteredRegistrations.map((r) => {
                const checked = selectedIds.has(r.id);

                return (
                  <div key={r.id} className="flex items-center gap-3 p-4">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggleOne(r.id)}
                      id={`select-${r.id}`}
                    />
                    <Label htmlFor={`select-${r.id}`} className="flex-1 cursor-pointer">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <div className="font-medium">
                          {r.name} {r.surname}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {r.mobile_number} • {formatAadhaar(r.aadhaar_number)}
                        </div>
                      </div>
                    </Label>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div
        id="print-area"
        className="mt-8 print:mt-0"
      >
        {pages.map((page, idx) => (
          <div key={idx} className="print-page">
            <div className="print-grid">
              {page.map((r) => {
                return <PrintableBadgeCard key={r.id} reg={r} />;
              })}
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
