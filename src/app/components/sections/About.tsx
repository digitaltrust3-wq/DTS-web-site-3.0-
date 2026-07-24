import { CheckCircle2 } from "lucide-react";
import { useLanguage } from "../../i18n/LanguageContext";

export function About() {
  const { copy } = useLanguage();
  const about = copy.about;

  return (
    <section className="content-section" id="about" aria-labelledby="about-title">
      <div className="wide-shell">
        <div className="content-split content-split--about">
          <div className="content-copy about-intro">
            <h2 className="text-white" id="about-title">{about.title}</h2>
            <div className="about-description">
              <p>{about.first}</p>
              <p>{about.second}</p>
            </div>
          </div>

          <div className="about-benefits">
            <ul className="about-benefits__list">
              {about.highlights.map((highlight) => (
                <li key={highlight}>
                  <CheckCircle2 aria-hidden="true" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>

            <p className="about-statement">{about.statement}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
