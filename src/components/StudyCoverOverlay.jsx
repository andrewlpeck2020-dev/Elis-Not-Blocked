import { ArrowLeft, BookOpen } from 'lucide-react';

export function StudyCoverOverlay({ isOpen, onClose }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[#fafafa] text-zinc-900"
      role="dialog"
      aria-modal="true"
      aria-labelledby="study-cover-title"
    >
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
          <div className="flex items-center gap-2.5">
            <BookOpen className="h-5 w-5 text-zinc-700" aria-hidden="true" />
            <h1 id="study-cover-title" className="text-lg font-semibold text-zinc-900">
              AP Calculus & Physics Reference Sheet
            </h1>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-100 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Return to Elis Not Blocked
          </button>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-zinc-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-zinc-900">01. Kinematics Equations</h2>
            <ul className="mt-3 space-y-2 text-sm text-zinc-700 font-mono-code">
              <li>v = v0 + at</li>
              <li>x = x0 + v0t + (1/2)at^2</li>
              <li>v^2 = v0^2 + 2a(x - x0)</li>
              <li>F_net = ma</li>
            </ul>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-zinc-900">02. Derivative Rules</h2>
            <ul className="mt-3 space-y-2 text-sm text-zinc-700 font-mono-code">
              <li>d/dx [x^n] = n * x^(n-1)</li>
              <li>d/dx [sin(x)] = cos(x)</li>
              <li>d/dx [cos(x)] = -sin(x)</li>
              <li>d/dx [e^x] = e^x</li>
            </ul>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-5 md:col-span-2">
            <h2 className="text-sm font-semibold text-zinc-900">03. Fundamental Theorem of Calculus</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600">
              If f is continuous on [a, b] and F is an antiderivative of f on [a, b], then the
              definite integral from a to b of f(x) dx equals F(b) - F(a). Press backslash (\) or
              use the button above to return.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
