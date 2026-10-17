export default function SaveBar({ onSave }: { onSave: () => void }) {
  return (
    <div className="flex justify-end mt-5">
      <button
        onClick={onSave}
        className="h-11 px-6 rounded-full text-white font-semibold text-[15px] transition-transform active:scale-95 btn-primary-pill"
      >
        حفظ التغييرات
      </button>
    </div>
  );
}
