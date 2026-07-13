import { ImageWithFallback } from "./figma/ImageWithFallback";
import { CheckCircle2 } from "lucide-react";

const highlights = [
  "15+ years of industry expertise",
  "Award-winning development team",
  "Agile methodology & rapid delivery",
  "24/7 support & maintenance",
];

export function About() {
  return (
    <section className="py-24 px-6 bg-white" id="about">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-slate-700 mb-6">About Digital Trust Solutions</h2>
            <p className="text-slate-600 text-lg mb-6">
              Founded with a vision to bridge the gap between technology and business success, 
              Digital Trust Solutions has been at the forefront of digital innovation for over a decade.
            </p>
            <p className="text-slate-600 mb-8">
              Our team of experienced developers, designers, and strategists work collaboratively 
              to deliver solutions that not only meet but exceed expectations. We believe in building 
              long-term partnerships with our clients, ensuring their success in an ever-evolving digital landscape.
            </p>
            
            <div className="space-y-3">
              {highlights.map((highlight) => (
                <div key={highlight} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-slate-600 flex-shrink-0" />
                  <span className="text-slate-700">{highlight}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2Z0d2FyZSUyMGRldmVsb3BtZW50JTIwdGVhbXxlbnwxfHx8fDE3NjA2MTIzNzh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Digital Trust Solutions team collaboration"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-72 h-72 bg-slate-300/20 rounded-2xl -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
