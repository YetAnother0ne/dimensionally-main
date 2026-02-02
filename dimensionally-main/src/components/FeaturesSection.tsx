import { motion } from "framer-motion";
import { Check, Zap, Shield, Clock } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Fast conversion in seconds, not hours",
  },
  {
    icon: Shield,
    title: "High Quality",
    description: "Production-ready outputs with clean topology",
  },
  {
    icon: Clock,
    title: "Batch Processing",
    description: "Convert multiple files simultaneously",
  },
];

const allFormats = {
  "3D Formats": ["FBX", "OBJ", "GLTF", "GLB", "STL", "USDZ", "DAE", "BLEND"],
  "2D Formats": ["PNG", "JPG", "WEBP", "TIFF", "EXR", "PSD"],
};

export const FeaturesSection = () => {
  return (
    <section className="py-24 px-4 border-t border-border/50">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Professional Tools,
              <br />
              <span className="gradient-text">Simple Interface</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              We've packed industry-leading conversion technology into an interface anyone can use. 
              No complex settings, no learning curve—just results.
            </p>

            <div className="space-y-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="glass-card rounded-2xl p-8">
              <h3 className="font-display text-2xl font-bold mb-6">Supported Formats</h3>
              
              {Object.entries(allFormats).map(([category, formats]) => (
                <div key={category} className="mb-6 last:mb-0">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">{category}</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {formats.map((format) => (
                      <div
                        key={format}
                        className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50"
                      >
                        <Check className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">{format}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
