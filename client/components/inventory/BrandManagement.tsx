import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getEmployeeSession } from "@/lib/auth";

export interface Brand {
  id: string;
  name: string;
  modelName: string;
  hsnCode: string;
  description: string;
  createdAt: string;
}

const DEFAULT_FORM = {
  name: "",
  modelName: "",
  hsnCode: "",
  description: "",
};

export function BrandManagement() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const employeeSession = getEmployeeSession();

  useEffect(() => {
    void loadBrands();
  }, []);

  const loadBrands = async () => {
    setIsLoading(true);
    try {
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from("brands")
            .select("*")
            .order("created_at", { ascending: false });
          if (error) throw error;
          const rows: Brand[] =
            data?.map((row: any) => ({
              id: row.id,
              name: row.name || "",
              modelName: row.model_name || "",
              hsnCode: row.hsn_code || "",
              description: row.description || "",
              createdAt: new Date(row.created_at).toLocaleDateString(),
            })) || [];
          setBrands(rows);
          return;
        } catch (supabaseError: any) {
          console.warn("Supabase brands load failed, falling back to localStorage:", supabaseError?.message);
        }
      }
      const raw = localStorage.getItem("crm_brands");
      if (raw) setBrands(JSON.parse(raw));
    } catch (error) {
      console.error("Error loading brands:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        modelName: form.modelName.trim(),
        hsnCode: form.hsnCode.trim(),
        description: form.description.trim(),
      };

      if (editingId) {
        if (supabase) {
          const { error } = await supabase
            .from("brands")
            .update({
              name: payload.name,
              model_name: payload.modelName,
              hsn_code: payload.hsnCode,
              description: payload.description,
            })
            .eq("id", editingId);
          if (error) throw error;
        }

        const updated = brands.map((item) =>
          item.id === editingId
            ? { ...item, ...payload, createdAt: item.createdAt }
            : item
        );
        setBrands(updated);
        localStorage.setItem("crm_brands", JSON.stringify(updated));
      } else {
        if (supabase) {
          let userId: string | undefined;

          if (employeeSession) {
            userId = employeeSession.employeeId;
          } else {
            try {
              const { data: userData } = await supabase.auth.getUser();
              userId = userData.user?.id;
            } catch (err) {
              console.warn("Could not fetch Supabase user:", err);
            }
          }

          if (!userId) {
            throw new Error("User not authenticated");
          }

          try {
            const { data, error } = await supabase
              .from("brands")
              .insert([
                {
                  user_id: userId,
                  name: payload.name,
                  model_name: payload.modelName,
                  hsn_code: payload.hsnCode,
                  description: payload.description,
                },
              ])
              .select()
              .single();
            if (error) throw error;

            const created: Brand = {
              id: data.id,
              name: data.name,
              modelName: data.model_name,
              hsnCode: data.hsn_code,
              description: data.description,
              createdAt: new Date(data.created_at).toLocaleDateString(),
            };
            setBrands((prev) => [created, ...prev]);
          } catch (supabaseError: any) {
            console.warn("Supabase insert failed, falling back to localStorage:", supabaseError?.message);
            const created: Brand = {
              id: `brand_${Date.now()}`,
              createdAt: new Date().toLocaleDateString(),
              ...payload,
            };
            const updated = [created, ...brands];
            setBrands(updated);
            localStorage.setItem("crm_brands", JSON.stringify(updated));
          }
        } else {
          const created: Brand = {
            id: `brand_${Date.now()}`,
            createdAt: new Date().toLocaleDateString(),
            ...payload,
          };
          const updated = [created, ...brands];
          setBrands(updated);
          localStorage.setItem("crm_brands", JSON.stringify(updated));
        }
      }

      setForm(DEFAULT_FORM);
      setEditingId(null);
    } catch (error: any) {
      console.error("Error saving brand:", error);
      alert(error?.message || "Failed to save brand.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this brand?")) return;
    try {
      if (supabase) {
        const { error } = await supabase.from("brands").delete().eq("id", id);
        if (error) throw error;
      }
      const updated = brands.filter((item) => item.id !== id);
      setBrands(updated);
      localStorage.setItem("crm_brands", JSON.stringify(updated));
    } catch (error: any) {
      console.error("Error deleting brand:", error);
      alert(error?.message || "Failed to delete brand.");
    }
  };

  const handleEdit = (item: Brand) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      modelName: item.modelName,
      hsnCode: item.hsnCode,
      description: item.description,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(DEFAULT_FORM);
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? "Edit Brand" : "Add Brand"}
        </h2>
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            className="px-4 py-2 border border-border rounded-lg bg-background"
            placeholder="Brand Name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <input
            className="px-4 py-2 border border-border rounded-lg bg-background"
            placeholder="Model Name"
            value={form.modelName}
            onChange={(e) => setForm((prev) => ({ ...prev, modelName: e.target.value }))}
            required
          />
          <input
            className="px-4 py-2 border border-border rounded-lg bg-background"
            placeholder="HSN Code"
            value={form.hsnCode}
            onChange={(e) => setForm((prev) => ({ ...prev, hsnCode: e.target.value }))}
          />
          <input
            className="px-4 py-2 border border-border rounded-lg bg-background"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          />
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {isSaving ? "Saving..." : editingId ? "Update Brand" : "Save Brand"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="inline-flex items-center justify-center rounded-lg border border-border px-5 py-2.5 hover:bg-muted/50"
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold mb-4">Brand List</h2>
        {isLoading ? (
          <p className="text-muted-foreground">Loading brands...</p>
        ) : brands.length === 0 ? (
          <p className="text-muted-foreground">No brands yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-2 text-left">Brand Name</th>
                  <th className="px-4 py-2 text-left">Model Name</th>
                  <th className="px-4 py-2 text-left">HSN Code</th>
                  <th className="px-4 py-2 text-left">Description</th>
                  <th className="px-4 py-2 text-left">Created</th>
                  <th className="px-4 py-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {brands.map((brand) => (
                  <tr key={brand.id} className="border-b border-border hover:bg-muted/40">
                    <td className="px-4 py-2 font-semibold">{brand.name}</td>
                    <td className="px-4 py-2">{brand.modelName}</td>
                    <td className="px-4 py-2">{brand.hsnCode || "-"}</td>
                    <td className="px-4 py-2 text-muted-foreground text-xs max-w-xs truncate">{brand.description || "-"}</td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">{brand.createdAt}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleEdit(brand)}
                          className="inline-flex items-center gap-1 text-primary hover:text-primary/90"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(brand.id)}
                          className="inline-flex items-center gap-1 text-destructive hover:text-destructive/90"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
