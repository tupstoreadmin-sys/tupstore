// One CTA button's fields (text, type, and a type-appropriate target
// picker), used twice inside HeroSlideFormModal for Button 1/Button 2 —
// extracted to its own file to avoid duplicating the same ~60 lines of
// JSX, matching this project's general pattern of extracting repeated form
// sections into their own component (CategoryImageUpload,
// ProductImageManager, etc.).
//
// Button types are restricted to exactly what
// db/migrations/0019_admin_hero_slides.sql's CHECK constraint allows:
// category | product | whatsapp | url | '' (unused). `target` means a
// different thing per type — categories.id, products.id, a raw URL, or
// (for whatsapp) nothing at all, since that CTA is expected to use the
// existing site-wide STORE_WHATSAPP_NUMBER configuration
// (src/utils/whatsapp.js), never a per-slide number entered here.
//
// @param {object} props
// @param {string} props.legend - e.g. "Button 1" / "Button 2"
// @param {string} props.text
// @param {(v: string) => void} props.onTextChange
// @param {''|'category'|'product'|'whatsapp'|'url'} props.type
// @param {(v: string) => void} props.onTypeChange
// @param {string} props.target
// @param {(v: string) => void} props.onTargetChange
// @param {string} [props.targetError] - shown under the category/product
//   picker, e.g. when "Go to a category" is selected but nothing was
//   picked (see HeroSlideFormModal.jsx's validate())
// @param {{id:string, name:string}[]} props.categories
// @param {{id:string, name:string}[]} props.products
// @param {boolean} [props.disabled]
export function HeroButtonFields({
  legend,
  text,
  onTextChange,
  type,
  onTypeChange,
  target,
  onTargetChange,
  targetError,
  categories,
  products,
  disabled,
}) {
  const handleTypeChange = (nextType) => {
    onTypeChange(nextType)
    // A target from one type (e.g. a category id) is meaningless once the
    // type changes to another kind (e.g. url) — clearing it here prevents
    // a stale, wrong-shaped value from being silently saved.
    onTargetChange('')
  }

  return (
    <fieldset className="rounded-md border border-slate-200 p-3">
      <legend className="px-1 text-xs font-semibold text-slate-600">
        {legend}
      </legend>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Button Text
          </label>
          <input
            type="text"
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            disabled={disabled}
            placeholder="Optional"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:opacity-50"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Button Action
          </label>
          <select
            value={type}
            onChange={(e) => handleTypeChange(e.target.value)}
            disabled={disabled}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:opacity-50"
          >
            <option value="">Not used</option>
            <option value="category">Go to a category</option>
            <option value="product">Go to a product</option>
            <option value="whatsapp">Open WhatsApp</option>
            <option value="url">External link</option>
          </select>
        </div>

        {type === 'category' && (
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Category
            </label>
            <select
              value={target}
              onChange={(e) => onTargetChange(e.target.value)}
              disabled={disabled}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:opacity-50"
            >
              <option value="">Select a category…</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {targetError && (
              <p className="mt-1 text-xs text-red-600">{targetError}</p>
            )}
          </div>
        )}

        {type === 'product' && (
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Product
            </label>
            <select
              value={target}
              onChange={(e) => onTargetChange(e.target.value)}
              disabled={disabled}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:opacity-50"
            >
              <option value="">Select a product…</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {type === 'whatsapp' && (
          <div className="sm:col-span-2">
            <p className="text-xs text-slate-400">
              Opens the store&apos;s existing WhatsApp number. No target to
              select.
            </p>
          </div>
        )}

        {type === 'url' && (
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-slate-600">
              External URL
            </label>
            <input
              type="text"
              value={target}
              onChange={(e) => onTargetChange(e.target.value)}
              disabled={disabled}
              placeholder="https://…"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:opacity-50"
            />
          </div>
        )}
      </div>
    </fieldset>
  )
}
