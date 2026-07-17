import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getEmployeeSession } from "@/lib/auth";

export interface BrandModel {
  id: string;
  modelName: string;
  hsnCode: string;
  description: string;
}

export interface Brand {
  id: string;
  name: string;
  models: BrandModel[];
  createdAt: string;
}

const DEFAULT_BRAND_FORM = {
  name: "",
};

const DEFAULT_MODEL_FORM = {
  modelName: "",
  hsnCode: "",
  description: "",
};

export function BrandManagement() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandForm, setBrandForm] = useState(DEFAULT_BRAND_FORM);
  const [modelForm, setModelForm] = useState(DEFAULT_MODEL_FORM);
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [editingModelId, setEditingModelId] = useState<string | null>(null);
  const [expandedBrandId, setExpandedBrandId] = useState<string | null>(null);
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

          const { data: modelsData, error: modelsError } = await supabase
            .from("brand_models")
            .select("*");
          if (modelsError) throw modelsError;

          const rows: Brand[] =
            data?.map((row: any) => ({
              id: row.id,
              name: row.name || "",
              models: modelsData
                ?.filter((m: any) => m.brand_id === row.id)
                .map((m: any) => ({
                  id: m.id,
                  modelName: m.model_name || "",
                  hsnCode: m.hsn_code || "",
                  description: m.description || "",
                })) || [],
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

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        name: brandForm.name.trim(),
      };

      if (editingBrandId) {
        if (supabase) {
          const { error } = await supabase
            .from("brands")
            .update({ name: payload.name })
            .eq("id", editingBrandId);
          if (error) throw error;
        }

        const updated = brands.map((item) =>
          item.id === editingBrandId
            ? { ...item, name: payload.name }
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
                },
              ])
              .select()
              .single();
            if (error) throw error;

            const created: Brand = {
              id: data.id,
              name: data.name,
              models: [],
              createdAt: new Date(data.created_at).toLocaleDateString(),
            };
            setBrands((prev) => [created, ...prev]);
            setSelectedBrandId(created.id);
          } catch (supabaseError: any) {
            console.warn("Supabase insert failed, falling back to localStorage:", supabaseError?.message);
            const created: Brand = {
              id: `brand_${Date.now()}`,
              name: payload.name,
              models: [],
              createdAt: new Date().toLocaleDateString(),
            };
            const updated = [created, ...brands];
            setBrands(updated);
            localStorage.setItem("crm_brands", JSON.stringify(updated));
            setSelectedBrandId(created.id);
          }
        } else {
          const created: Brand = {
            id: `brand_${Date.now()}`,
            name: payload.name,
            models: [],
            createdAt: new Date().toLocaleDateString(),
          };
          const updated = [created, ...brands];
          setBrands(updated);
          localStorage.setItem("crm_brands", JSON.stringify(updated));
          setSelectedBrandId(created.id);
        }
      }

      setBrandForm(DEFAULT_BRAND_FORM);
      setEditingBrandId(null);
    } catch (error: any) {
      console.error("Error saving brand:", error);
      alert(error?.message || "Failed to save brand.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBrandId) {
      alert("Please select a brand first");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        modelName: modelForm.modelName.trim(),
        hsnCode: modelForm.hsnCode.trim(),
        description: modelForm.description.trim(),
      };

      if (editingModelId) {
        if (supabase) {
          const { error } = await supabase
            .from("brand_models")
            .update({
              model_name: payload.modelName,
              hsn_code: payload.hsnCode,
              description: payload.description,
            })
            .eq("id", editingModelId);
          if (error) throw error;
        }

        const updated = brands.map((brand) =>
          brand.id === selectedBrandId
            ? {
                ...brand,
                models: brand.models.map((model) =>
                  model.id === editingModelId
                    ? { ...model, ...payload }
                    : model
                ),
              }
            : brand
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
              .from("brand_models")
              .insert([
                {
                  user_id: userId,
                  brand_id: selectedBrandId,
                  model_name: payload.modelName,
                  hsn_code: payload.hsnCode,
                  description: payload.description,
                },
              ])
              .select()
              .single();
            if (error) throw error;

            const created: BrandModel = {
              id: data.id,
              modelName: data.model_name,
              hsnCode: data.hsn_code,
              description: data.description,
            };

            const updated = brands.map((brand) =>
              brand.id === selectedBrandId
                ? { ...brand, models: [created, ...brand.models] }
                : brand
            );
            setBrands(updated);
          } catch (supabaseError: any) {
            console.warn("Supabase insert failed, falling back to localStorage:", supabaseError?.message);
            const created: BrandModel = {
              id: `model_${Date.now()}`,
              ...payload,
            };

            const updated = brands.map((brand) =>
              brand.id === selectedBrandId
                ? { ...brand, models: [created, ...brand.models] }
                : brand
            );
            setBrands(updated);
            localStorage.setItem("crm_brands", JSON.stringify(updated));
          }
        } else {
          const created: BrandModel = {
            id: `model_${Date.now()}`,
            ...payload,
          };

          const updated = brands.map((brand) =>
            brand.id === selectedBrandId
              ? { ...brand, models: [created, ...brand.models] }
              : brand
          );
          setBrands(updated);
          localStorage.setItem("crm_brands", JSON.stringify(updated));
        }
      }

      setModelForm(DEFAULT_MODEL_FORM);
      setEditingModelId(null);
    } catch (error: any) {
      console.error("Error saving model:", error);
      alert(error?.message || "Failed to save model.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBrand = async (id: string) => {
    if (!window.confirm("Delete this brand and all its models?")) return;
    try {
      if (supabase) {
        const { error: modelError } = await supabase.from("brand_models").delete().eq("brand_id", id);
        if (modelError) throw modelError;

        const { error } = await supabase.from("brands").delete().eq("id", id);
        if (error) throw error;
      }
      const updated = brands.filter((item) => item.id !== id);
      setBrands(updated);
      localStorage.setItem("crm_brands", JSON.stringify(updated));
      if (selectedBrandId === id) {
        setSelectedBrandId(null);
      }
    } catch (error: any) {
      console.error("Error deleting brand:", error);
      alert(error?.message || "Failed to delete brand.");
    }
  };

  const handleDeleteModel = async (brandId: string, modelId: string) => {
    if (!window.confirm("Delete this model?")) return;
    try {
      if (supabase) {
        const { error } = await supabase.from("brand_models").delete().eq("id", modelId);
        if (error) throw error;
      }
      const updated = brands.map((brand) =>
        brand.id === brandId
          ? { ...brand, models: brand.models.filter((m) => m.id !== modelId) }
          : brand
      );
      setBrands(updated);
      localStorage.setItem("crm_brands", JSON.stringify(updated));
    } catch (error: any) {
      console.error("Error deleting model:", error);
      alert(error?.message || "Failed to delete model.");
    }
  };

  const handleEditBrand = (item: Brand) => {
    setEditingBrandId(item.id);
    setBrandForm({ name: item.name });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEditModel = (model: BrandModel) => {
    setEditingModelId(model.id);
    setModelForm({
      modelName: model.modelName,
      hsnCode: model.hsnCode,
      description: model.description,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingBrandId(null);
    setBrandForm(DEFAULT_BRAND_FORM);
  };

  const cancelModelEdit = () => {
    setEditingModelId(null);
    setModelForm(DEFAULT_MODEL_FORM);
  };

  return (
    <div className="space-y-6">
      {/* Brand Form */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold mb-4">
          {editingBrandId ? "Edit Brand" : "Add Brand"}
        </h2>
        <form onSubmit={handleSaveBrand} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            className="px-4 py-2 border border-border rounded-lg bg-background"
            placeholder="Brand Name"
            value={brandForm.name}
            onChange={(e) => setBrandForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {isSaving ? "Saving..." : editingBrandId ? "Update Brand" : "Save Brand"}
          </button>
          {editingBrandId && (
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

      {/* Model Form */}
      {selectedBrandId && (
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingModelId ? "Edit Model" : "Add Model to Selected Brand"}
          </h2>
          <form onSubmit={handleSaveModel} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="px-4 py-2 border border-border rounded-lg bg-background"
              placeholder="Model Name"
              value={modelForm.modelName}
              onChange={(e) => setModelForm((prev) => ({ ...prev, modelName: e.target.value }))}
              required
            />
            <input
              className="px-4 py-2 border border-border rounded-lg bg-background"
              placeholder="HSN Code"
              value={modelForm.hsnCode}
              onChange={(e) => setModelForm((prev) => ({ ...prev, hsnCode: e.target.value }))}
            />
            <input
              className="px-4 py-2 border border-border rounded-lg bg-background md:col-span-2"
              placeholder="Description"
              value={modelForm.description}
              onChange={(e) => setModelForm((prev) => ({ ...prev, description: e.target.value }))}
            />
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {isSaving ? "Saving..." : editingModelId ? "Update Model" : "Save Model"}
            </button>
            {editingModelId && (
              <button
                type="button"
                onClick={cancelModelEdit}
                className="inline-flex items-center justify-center rounded-lg border border-border px-5 py-2.5 hover:bg-muted/50"
              >
                Cancel
              </button>
            )}
          </form>
        </div>
      )}

      {/* Brands and Models List */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold mb-4">Brands & Models</h2>
        {isLoading ? (
          <p className="text-muted-foreground">Loading brands...</p>
        ) : brands.length === 0 ? (
          <p className="text-muted-foreground">No brands yet. Create one to get started.</p>
        ) : (
          <div className="space-y-3">
            {brands.map((brand) => (
              <div key={brand.id} className="border border-border rounded-lg overflow-hidden">
                <div
                  className={`p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedBrandId === brand.id ? "bg-primary/10" : ""
                  }`}
                  onClick={() => {
                    setSelectedBrandId(brand.id);
                    setExpandedBrandId(expandedBrandId === brand.id ? null : brand.id);
                  }}
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{brand.name}</h3>
                    <p className="text-xs text-muted-foreground">{brand.models.length} models</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditBrand(brand);
                      }}
                      className="px-3 py-1 text-sm text-primary hover:text-primary/90 border border-primary rounded hover:bg-primary/10"
                    >
                      Edit Brand
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        void handleDeleteBrand(brand.id);
                      }}
                      className="px-3 py-1 text-sm text-destructive hover:text-destructive/90 border border-destructive rounded hover:bg-destructive/10"
                    >
                      Delete
                    </button>
                    {expandedBrandId === brand.id ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </div>

                {expandedBrandId === brand.id && (
                  <div className="bg-muted/30 border-t border-border p-4 space-y-3">
                    {brand.models.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">No models added yet. Add one using the form above.</p>
                    ) : (
                      brand.models.map((model) => (
                        <div
                          key={model.id}
                          className="bg-background border border-border rounded p-3 flex items-start justify-between gap-4"
                        >
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">{model.modelName}</h4>
                            {model.hsnCode && (
                              <p className="text-xs text-muted-foreground">HSN: {model.hsnCode}</p>
                            )}
                            {model.description && (
                              <p className="text-xs text-muted-foreground mt-1">{model.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedBrandId(brand.id);
                                handleEditModel(model);
                              }}
                              className="text-xs text-primary hover:text-primary/90"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDeleteModel(brand.id, model.id)}
                              className="text-xs text-destructive hover:text-destructive/90"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
