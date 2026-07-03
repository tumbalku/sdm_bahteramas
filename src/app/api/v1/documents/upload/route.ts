import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { uploadDocumentSchema } from "@/modules/documents/validation";
import { uploadDocumentService } from "@/modules/documents/service";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    
    const getStringOrUndefined = (val: FormDataEntryValue | null) => {
      if (typeof val === "string" && val.trim() !== "" && val !== "null" && val !== "undefined") {
        return val.trim();
      }
      return undefined;
    };

    // Convert formData to simple object for Zod validation (non-file fields)
    const formFields = {
      documentTypeId: getStringOrUndefined(formData.get("documentTypeId")) || "",
      replaceDocumentId: getStringOrUndefined(formData.get("replaceDocumentId")),
      documentNumber: getStringOrUndefined(formData.get("documentNumber")),
      issueDate: getStringOrUndefined(formData.get("issueDate")),
      expiryDate: getStringOrUndefined(formData.get("expiryDate")),
    };
    
    const file = formData.get("file") as File | null;
    if (!file || typeof file === "string") {
      return NextResponse.json({ message: "File wajib diunggah" }, { status: 400 });
    }

    const parseResult = uploadDocumentSchema.safeParse(formFields);
    if (!parseResult.success) {
      return NextResponse.json(
        { message: "Input tidak valid", errors: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const actor = {
      id: session.user.id,
      name: session.user.name || "Unknown",
      role: session.user.role,
      employeeId: session.user.employeeId || "UNKNOWN",
    };
    
    // Secara default, file diupload untuk milik user yang login. 
    // Jika nantinya admin bisa upload file untuk user lain, ini bisa dikembangkan, 
    // namun di PRD: "EMPLOYEE upload dokumen milik sendiri".
    const ownerId = session.user.id;

    // Ambil IP (optional)
    const ipAddress = request.headers.get("x-forwarded-for") || "unknown";

    const document = await uploadDocumentService(
      {
        ownerId,
        documentTypeId: parseResult.data.documentTypeId,
        replaceDocumentId: parseResult.data.replaceDocumentId,
        documentNumber: parseResult.data.documentNumber ?? undefined,
        issueDate: parseResult.data.issueDate ?? undefined,
        expiryDate: parseResult.data.expiryDate ?? undefined,
        file,
      },
      actor,
      ipAddress
    );

    return NextResponse.json(document, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/v1/documents/upload Error:", error);
    return NextResponse.json(
      { message: error.message || "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
