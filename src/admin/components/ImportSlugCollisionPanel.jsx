// Readable explanations for every generated-slug collision — both within
// the uploaded file (two rows whose names produce the same slug) and
// against Supabase (a generated slug that already belongs to a real
// product). Sourced entirely from productImportReview.js's slugCollisions
// list, which itself only re-describes findings productImportValidator.js
// already computed — no new rule, no Supabase call here.

/**
 * @param {object} props
 * @param {{productCode: string, productName: string, slug: string, type: 'duplicate-in-file'|'existing-in-supabase'}[]} props.slugCollisions
 */
export function ImportSlugCollisionPanel({ slugCollisions }) {
  if (slugCollisions.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      {slugCollisions.map((collision, index) => (
        <div
          key={index}
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <p>
            <span className="font-semibold">
              {collision.productCode} ({collision.productName})
            </span>{' '}
            generates the slug <span className="font-mono">{collision.slug}</span>,{' '}
            {collision.type === 'duplicate-in-file'
              ? 'which is already used by another row in this file.'
              : 'which already exists as a product in Supabase.'}
          </p>
        </div>
      ))}
    </div>
  )
}
