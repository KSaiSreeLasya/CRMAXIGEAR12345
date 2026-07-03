import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, ChevronDown } from "lucide-react";
import { fetchDMSDealers, DMSDealer } from "@/lib/dealers";
import { supabase } from "@/lib/supabase";

interface DetailedInventoryItem {
  id: string;
  modelNo: string;
  brand: string;
  vehicleModel: string;
  hsnNo: string;
  vehicleCount: number;
  closingStock: number;
  motorNo: string;
  batteryNo: string;
  batteryModel: string;
  chassisNos: string[];
  partName?: string;
}

interface SelectedVehicle {
  chassisNo: string;
  motorNo: string;
  batteryNo: string;
}

interface InventoryDispatchFormProps {
  inventoryItems: DetailedInventoryItem[];
  onDispatch: (allocation: {
    sku: string;
    productName: string;
    category: "vehicles" | "spares";
    quantity: number;
    dealerId: string;
    chassisNo?: string;
    motorNo?: string;
    batteryNo?: string;
  }) => Promise<boolean>;
}

export default function InventoryDispatchForm({
  inventoryItems,
  onDispatch,
}: InventoryDispatchFormProps) {
  const [formData, setFormData] = useState({
    productId: "",
    dealerId: "",
    category: "vehicles" as "vehicles" | "spares",
    quantity: "",
  });

  const [selectedVehicles, setSelectedVehicles] = useState<SelectedVehicle[]>([]);
  const [dealers, setDealers] = useState<DMSDealer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDealers, setIsLoadingDealers] = useState(true);
  const [showVehicleList, setShowVehicleList] = useState(false);

  useEffect(() => {
    loadDealers();
  }, []);

  const loadDealers = async () => {
    setIsLoadingDealers(true);
    try {
      const dealersData = await fetchDMSDealers();
      setDealers(dealersData);
    } catch (error) {
      console.error("Error loading dealers:", error);
      toast.error("Failed to load dealers");
    } finally {
      setIsLoadingDealers(false);
    }
  };

  const filteredProducts = inventoryItems.filter((item) => {
    if (formData.category === "vehicles") {
      return item.modelNo && !item.partName;
    } else {
      return item.partName && !item.modelNo;
    }
  });

  const selectedProduct = filteredProducts.find(
    (item) => item.id === formData.productId
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "category") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        productId: "",
      }));
      setSelectedVehicles([]);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const toggleVehicleSelection = (vehicle: SelectedVehicle) => {
    setSelectedVehicles((prev) => {
      const exists = prev.find(
        (v) => v.chassisNo === vehicle.chassisNo && v.motorNo === vehicle.motorNo
      );
      if (exists) {
        return prev.filter(
          (v) => !(v.chassisNo === vehicle.chassisNo && v.motorNo === vehicle.motorNo)
        );
      } else {
        return [...prev, vehicle];
      }
    });
  };

  const validateForm = () => {
    if (!formData.productId) {
      toast.error("Please select a product");
      return false;
    }
    if (formData.category === "vehicles") {
      if (selectedVehicles.length === 0) {
        toast.error("Please select at least one vehicle");
        return false;
      }
    } else {
      if (!formData.quantity || Number(formData.quantity) <= 0) {
        toast.error("Please enter a valid quantity");
        return false;
      }
    }
    if (!formData.dealerId) {
      toast.error("Please select a dealer");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (formData.category === "vehicles") {
        // Dispatch each selected vehicle individually
        for (const vehicle of selectedVehicles) {
          const success = await onDispatch({
            sku: selectedProduct?.modelNo || "N/A",
            productName: selectedProduct?.modelNo || "Unknown Product",
            category: "vehicles",
            quantity: 1,
            dealerId: formData.dealerId,
            chassisNo: vehicle.chassisNo,
            motorNo: vehicle.motorNo,
            batteryNo: vehicle.batteryNo,
          });

          if (!success) {
            toast.error(`Failed to dispatch vehicle with chassis ${vehicle.chassisNo}`);
            setIsLoading(false);
            return;
          }
        }
        toast.success(`${selectedVehicles.length} vehicle(s) dispatched successfully`);
      } else {
        // Spares dispatch
        const success = await onDispatch({
          sku: selectedProduct?.partName || "N/A",
          productName: selectedProduct?.partName || "Unknown Product",
          category: "spares",
          quantity: Number(formData.quantity),
          dealerId: formData.dealerId,
        });

        if (success) {
          toast.success("Shipment dispatched successfully");
        } else {
          toast.error("Failed to dispatch shipment");
        }
      }

      // Reset form
      setFormData({
        productId: "",
        quantity: "",
        dealerId: "",
        category: "vehicles",
      });
      setSelectedVehicles([]);
    } catch (error) {
      console.error("Error dispatching inventory:", error);
      toast.error("Failed to dispatch shipment");
    } finally {
      setIsLoading(false);
    }
  };

  const isVehicleCategory = formData.category === "vehicles";

  return (
    <div className="bg-background rounded-lg border border-border p-6">
      <h2 className="text-xl font-semibold mb-6">Create Shipment</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category Selection */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-2">
              Product Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="vehicles">Vehicles</option>
              <option value="spares">Spares</option>
            </select>
          </div>

          {/* Product Selection */}
          <div>
            <label htmlFor="productId" className="block text-sm font-medium mb-2">
              Select Product *
            </label>
            <select
              id="productId"
              name="productId"
              value={formData.productId}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">-- Select a {formData.category === "vehicles" ? "vehicle" : "spare"} --</option>
              {filteredProducts.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.modelNo || item.partName} ({item.closingStock || 0} in stock)
                </option>
              ))}
            </select>
          </div>

          {/* Dealer Selection */}
          <div className="md:col-span-2">
            <label htmlFor="dealerId" className="block text-sm font-medium mb-2">
              Target Dealer *
            </label>
            {isLoadingDealers ? (
              <div className="px-4 py-2 border border-border rounded-lg bg-muted text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading dealers...
              </div>
            ) : (
              <select
                id="dealerId"
                name="dealerId"
                value={formData.dealerId}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">-- Select a dealer --</option>
                {dealers.map((dealer) => (
                  <option key={dealer.id} value={dealer.id}>
                    {dealer.name} ({dealer.code})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Vehicle Selection Section */}
          {isVehicleCategory && selectedProduct && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Select Vehicles to Dispatch * ({selectedVehicles.length} selected)
              </label>
              <div className="border border-border rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowVehicleList(!showVehicleList)}
                  className="w-full px-4 py-3 bg-muted hover:bg-muted/80 flex items-center justify-between font-medium transition-colors"
                >
                  <span>
                    {selectedVehicles.length > 0
                      ? `${selectedVehicles.length} vehicle(s) selected`
                      : "Click to select vehicles"}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      showVehicleList ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showVehicleList && (
                  <div className="max-h-80 overflow-y-auto border-t border-border">
                    {selectedProduct.chassisNos && selectedProduct.chassisNos.length > 0 ? (
                      <div className="space-y-2 p-4">
                        {selectedProduct.chassisNos.map((chassis, idx) => {
                          const vehicle = {
                            chassisNo: chassis,
                            motorNo: selectedProduct.motorNo || `MTR-${idx}`,
                            batteryNo: selectedProduct.batteryNo || `BAT-${idx}`,
                          };
                          const isSelected = selectedVehicles.some(
                            (v) =>
                              v.chassisNo === vehicle.chassisNo &&
                              v.motorNo === vehicle.motorNo
                          );
                          return (
                            <label
                              key={idx}
                              className="flex items-start gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleVehicleSelection(vehicle)}
                                className="mt-1"
                              />
                              <div className="flex-1 text-sm">
                                <p className="font-medium">{chassis}</p>
                                <div className="text-xs text-muted-foreground space-y-1 mt-1">
                                  <p>
                                    <span className="font-semibold">Motor:</span> {vehicle.motorNo}
                                  </p>
                                  <p>
                                    <span className="font-semibold">Battery:</span>{" "}
                                    {vehicle.batteryNo}
                                  </p>
                                  {selectedProduct.batteryModel && (
                                    <p>
                                      <span className="font-semibold">Model:</span>{" "}
                                      {selectedProduct.batteryModel}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-muted-foreground text-sm">
                        No unsold vehicles available for this product
                      </div>
                    )}
                  </div>
                )}
              </div>

              {selectedVehicles.length > 0 && (
                <div className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
                  <h4 className="font-semibold text-sm mb-2 text-blue-900 dark:text-blue-100">
                    Selected Vehicles:
                  </h4>
                  <div className="space-y-1">
                    {selectedVehicles.map((v, idx) => (
                      <div key={idx} className="text-xs text-blue-800 dark:text-blue-200">
                        <span className="font-mono">{v.chassisNo}</span> | Motor:{" "}
                        <span className="font-mono">{v.motorNo}</span> | Battery:{" "}
                        <span className="font-mono">{v.batteryNo}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Spares Quantity */}
          {!isVehicleCategory && selectedProduct && (
            <div className="md:col-span-2">
              <label htmlFor="quantity" className="block text-sm font-medium mb-2">
                Quantity *
              </label>
              <div className="flex gap-2">
                <input
                  id="quantity"
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  placeholder="Enter quantity"
                  min="1"
                  className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {selectedProduct && (
                  <div className="px-4 py-2 border border-border rounded-lg bg-muted flex items-center text-sm">
                    <span className="font-medium">
                      Available: {selectedProduct.closingStock || 0}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        {selectedProduct && formData.dealerId && (isVehicleCategory ? selectedVehicles.length > 0 : formData.quantity) && (
          <div className="bg-muted p-4 rounded-lg border border-border">
            <h3 className="font-semibold mb-3">Shipment Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Product</p>
                <p className="font-medium">
                  {selectedProduct.modelNo || selectedProduct.partName}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Quantity</p>
                <p className="font-medium">
                  {isVehicleCategory ? selectedVehicles.length : formData.quantity} units
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Dealer</p>
                <p className="font-medium">
                  {dealers.find((d) => d.id === formData.dealerId)?.name}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className="font-medium text-yellow-600 dark:text-yellow-500">Pending</p>
              </div>
            </div>
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading || isLoadingDealers}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isLoading ? "Dispatching..." : "Dispatch Shipment"}
        </Button>
      </form>
    </div>
  );
}
