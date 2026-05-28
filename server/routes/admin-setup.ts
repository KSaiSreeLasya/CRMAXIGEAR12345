import { RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";

export const handleCreateAdminEmployee: RequestHandler = async (req, res) => {
  try {
    const { fullName, email, password, role = "Admin" } = req.body;

    if (!fullName || !email || !password) {
      res.status(400).json({
        error: "Missing required fields: fullName, email, password",
      });
      return;
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      res.status(500).json({
        error: "Supabase configuration missing",
      });
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase.rpc("create_employee", {
      p_full_name: fullName.trim(),
      p_email: email.trim().toLowerCase(),
      p_password: password.trim(),
      p_phone: null,
      p_role: role.trim(),
    });

    if (error) {
      console.error("Error creating admin employee:", error);
      res.status(500).json({
        error: error.message || "Failed to create admin employee",
      });
      return;
    }

    const employee = data?.[0];
    if (!employee) {
      res.status(500).json({
        error: "Employee was not created",
      });
      return;
    }

    res.json({
      success: true,
      employee: {
        id: employee.id,
        fullName: employee.full_name,
        email: employee.email,
        role: employee.role || "Admin",
        createdAt: employee.created_at,
      },
    });
  } catch (err: any) {
    console.error("Admin setup error:", err);
    res.status(500).json({
      error: err.message || "An error occurred",
    });
  }
};
