import { Button } from "./ui/button";
import { Mail, ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section id="contact" className="py-24 px-6 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800">
      <div className="max-w-4xl mx-auto text-center text-white">
        <h2 className="mb-6">Ready to Start Your Project?</h2>
        <p className="text-slate-200 text-lg mb-10">
          Let's discuss how we can help transform your business with innovative technology solutions. 
          Our team is ready to bring your vision to life.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" className="bg-white text-slate-800 hover:bg-slate-100 px-8 group shadow-lg">
            <Mail className="mr-2 w-5 h-5" />
            Contact Us
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8">
            Schedule a Call
          </Button>
        </div>
      </div>
    </section>
  );
}
