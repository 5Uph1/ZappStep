type OrderTrackingSectionProps = {
  trackingNumber: string;
  setTrackingNumber: (value: string) => void;
  shippingAddress: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  onUpdateTracking: () => void;
  updating: boolean;
  formatDate: (dateStr: string) => string;
};

export function OrderTrackingSection({
  trackingNumber,
  setTrackingNumber,
  shippingAddress,
  shippedAt,
  deliveredAt,
  onUpdateTracking,
  updating,
  formatDate,
}: OrderTrackingSectionProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
      <h2 className="text-lg font-bold text-slate-900 mb-4">
        Informasi Pengiriman
      </h2>

      <div className="mb-4">
        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
          Nomor Resi
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Masukkan nomor resi..."
            className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            onClick={onUpdateTracking}
            disabled={updating}
            className="px-4 py-2 rounded-lg bg-emerald-700 text-white text-sm font-bold hover:bg-emerald-800 transition-colors disabled:opacity-50"
          >
            Simpan
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
          Alamat Pengiriman
        </label>
        <div className="bg-slate-50 rounded-lg p-4 text-slate-700">
          {shippingAddress ? (
            <p className="whitespace-pre-wrap">{shippingAddress}</p>
          ) : (
            <p className="text-slate-400 italic">Belum diisi</p>
          )}
        </div>
      </div>

      {shippedAt && (
        <p className="text-xs text-slate-400 mt-3">
          Dikirim pada: {formatDate(shippedAt)}
        </p>
      )}
      {deliveredAt && (
        <p className="text-xs text-slate-400">
          Diterima pada: {formatDate(deliveredAt)}
        </p>
      )}
    </div>
  );
}
