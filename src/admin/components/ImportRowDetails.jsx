// Expanded content for one Import Review table row. Everything here comes
// straight from the parsed workbook (row.product/.images/.features/
// .specifications, all produced by productImportParser.js) — no Supabase
// call, no upload, nothing invented.

export function ImportRowDetails({ row }) {
  const { product, images, features, specifications } = row

  return (
    <div className="grid grid-cols-1 gap-4 bg-slate-50 p-4 sm:grid-cols-2">
      <div>
        <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Description
        </h4>
        <p className="text-sm text-slate-700">
          {product.description || <span className="text-slate-400">No description provided.</span>}
        </p>
      </div>

      <div>
        <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Gallery Images
        </h4>
        {images.length === 0 ? (
          <p className="text-sm text-slate-400">No gallery images listed.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {images.map((image, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-slate-700">
                <span className="truncate">{image.image_file || '(missing filename)'}</span>
                {image.is_primary && (
                  <span className="shrink-0 rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white">
                    Primary
                  </span>
                )}
                <span className="shrink-0 text-xs text-slate-400">
                  sort {image.sort_order ?? 0}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Features
        </h4>
        {features.length === 0 ? (
          <p className="text-sm text-slate-400">No features listed.</p>
        ) : (
          <ul className="list-inside list-disc text-sm text-slate-700">
            {features.map((feature, index) => (
              <li key={index}>{feature.label || '(blank)'}</li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Specifications
        </h4>
        {specifications.length === 0 ? (
          <p className="text-sm text-slate-400">No specifications listed.</p>
        ) : (
          <table className="w-full text-left text-sm text-slate-700">
            <tbody>
              {specifications.map((spec, index) => (
                <tr key={index} className="border-b border-slate-200 last:border-0">
                  <td className="py-1 pr-3 font-medium">{spec.spec_key || '(blank)'}</td>
                  <td className="py-1">{spec.spec_value || '(blank)'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
