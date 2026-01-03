import { toDevanagariDigits, romanToHindi } from "@/lib/hindi";

type Registration = {
  id: string;
  name: string;
  surname: string;
  mobile_number: string;
  alternate_mobile_number: string | null;
  emergency_contact_number: string;
  address: string | null;
  age: number | null;
  hypertension: string | null;
  sugar: string | null;
  image_url: string | null;
};

function hasDevanagari(input: string) {
  return /[\u0900-\u097F]/.test(input);
}

function toHindiText(input: string) {
  const v = (input || "").trim();
  if (!v) return "";
  if (hasDevanagari(v)) return toDevanagariDigits(v);
  return toDevanagariDigits(romanToHindi(v));
}

function toHindiNumber(input: string) {
  return toDevanagariDigits(input);
}

export function PrintableBadgeCard({ reg }: { reg: Registration }) {
  const fullName = `${reg.name} ${reg.surname}`.trim();
  const showHypertension = reg.hypertension === "Yes";
  const showDiabetes = reg.sugar === "Yes";

  const emergencyNumbers = [reg.emergency_contact_number, reg.alternate_mobile_number]
    .map((v) => (v || "").trim())
    .filter(Boolean)
    .join("/");

  return (
    <div className="badge-card">
      <div className="badge-header">
        <div className="badge-header-title">राधा स्वामी सत्संग ब्यास, पीथमपुर</div>
      </div>
      <div className="badge-subheader">वृद्ध संगत</div>

      <div className="badge-body">
        <div className="badge-photo">
          {reg.image_url ? (
            <img src={reg.image_url} alt={fullName} className="badge-photo-img" />
          ) : (
            <div className="badge-photo-placeholder" />
          )}
        </div>

        <div className="badge-details">
          <div className="badge-row">
            <div className="badge-label">नाम</div>
            <div className="badge-value badge-value-strong">{toHindiText(fullName)}</div>
          </div>
          <div className="badge-row">
            <div className="badge-label">पता</div>
            <div className="badge-value">{toHindiText(reg.address || "-")}</div>
          </div>
          <div className="badge-row">
            <div className="badge-label">मोबाइल नंबर</div>
            <div className="badge-value">{ emergencyNumbers }</div>
          </div>
          <div className="badge-row">
            <div className="badge-label">उम्र</div>
            <div className="badge-value">{reg.age != null ? toHindiNumber(String(reg.age)) : "-"}</div>
          </div>
        </div>

        {(showHypertension || showDiabetes) && (
          <div className="badge-flags">
            {showHypertension && <div className="badge-flag badge-flag-htn">हाइपर</div>}
            {showDiabetes && <div className="badge-flag badge-flag-dm">डायब</div>}
          </div>
        )}
      </div>

      <div className="badge-footer">
        <div className="badge-footer-left">इमरजेंसी नंबर</div>
        <div className="badge-footer-right">{toHindiNumber(emergencyNumbers || "-")}</div>
      </div>
    </div>
  );
}
