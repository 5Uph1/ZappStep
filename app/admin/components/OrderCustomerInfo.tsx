type OrderCustomerInfoProps = {
  email: string | null;
  userId: string;
};

export function OrderCustomerInfo({ email, userId }: OrderCustomerInfoProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
      <h2 className="text-lg font-bold text-slate-900 mb-4">
        Informasi Customer
      </h2>
      <div className="space-y-2">
        <p className="text-slate-700">
          <span className="font-semibold">Email:</span> {email || "N/A"}
        </p>
        <p className="text-slate-700">
          <span className="font-semibold">User ID:</span>{" "}
          <span className="font-mono text-sm">{userId}</span>
        </p>
      </div>
    </div>
  );
}
