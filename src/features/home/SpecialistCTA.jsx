import { cn } from '../../utils/cn'
import { Button } from '../../components/ui'
import {
  IconWhatsApp,
  IconRuler,
  IconShield,
  IconTruck,
} from '../../components/layout/icons'

// New Home section — visual parity with the approved home-final1 design's
// dark "Need Help Choosing the Right Tupperware?" CTA. Uses the existing
// `surface-dark` design-system token for the background (no new color
// introduced). Feature-row titles/descriptions are placeholder content
// (local to this component, not a new src/data/ file, since they're
// specific to this one section) pending a content milestone.
//
// The WhatsApp button is wired via the `onChatWhatsApp` callback prop —
// the caller (HomePage.jsx) supplies it using the existing centralized
// src/utils/whatsapp.js number, exactly like the Hero's WhatsApp CTA
// already does. "Call Store" has no confirmed phone number anywhere in
// this project yet (ContactPage.jsx's "Phone Helpline" is still a known
// placeholder) — `onCallStore` is accepted but intentionally left
// unwired from HomePage.jsx rather than inventing a number.

const FEATURES = [
  {
    icon: IconRuler,
    title: 'Custom Size & Capacity Guidance',
    description: 'Match your family size and storage requirements perfectly',
  },
  {
    icon: IconShield,
    title: '100% Genuine & Lifetime Guarantee',
    description: 'Official Kerala store support & authentic original items',
  },
  {
    icon: IconTruck,
    title: 'Doorstep Express Delivery',
    description: 'Fast & safe delivery anywhere across Kerala',
  },
]

/**
 * @param {object} props
 * @param {() => void} [props.onChatWhatsApp]
 * @param {() => void} [props.onCallStore]
 * @param {string} [props.className]
 */
export function SpecialistCTA({ onChatWhatsApp, onCallStore, className }) {
  return (
    <div
      className={cn(
        'rounded-xl bg-surface-dark px-6 py-12 sm:px-10 lg:px-14 lg:py-16',
        className
      )}
    >
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <div>
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-[12px] font-semibold text-white">
            <span className="pulse-dot"></span>
            <span>Free Personal Specialist Guidance</span>
          </span>
          <h2 className="mb-2 font-heading text-2xl font-bold leading-[1.15] text-white md:text-[38px]">
            Need Help Choosing the Right Tupperware?
          </h2>
          <p className="mb-8 text-sm sm:text-[15px] leading-relaxed text-white/70">
            Connect with our expert store team for personalized advice on
            kitchen organization, container capacity matching, and custom gift
            set curation.
          </p>

          <div className="mb-8 flex flex-col gap-3.5">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="flex items-start gap-[14px] rounded-[14px] transition-all duration-300 hover:border-white/20 hover:bg-white/[0.07]"
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '12px 16px',
                }}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                  <feature.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[14px] sm:text-[15px] font-bold text-white">
                    {feature.title}
                  </div>
                  <div className="text-xs sm:text-[13px] text-white/60 leading-normal mt-0.5">
                    {feature.description}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="wa" onClick={onChatWhatsApp}>
              <IconWhatsApp className="h-4 w-4" />
              Chat on WhatsApp
            </Button>
            <Button
              variant="secondary"
              onClick={onCallStore}
              className="border-white/30 bg-transparent text-white hover:border-white/50 hover:bg-white/10"
            >
              Call Store (+91 7736730041)
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg">
          <img
            src="/images/hero_kitchen.png"
            alt="Kitchen with Tupperware products"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </div>
  )
}
