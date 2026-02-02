import { motion } from "framer-motion";
import { Gamepad2, Film, Printer, Globe, Smartphone, Cog } from "lucide-react";

const useCases = [
  {
    icon: Gamepad2,
    title: "Game Development",
    description: "Create game-ready assets with optimized meshes and LODs",
    formats: ["FBX", "GLTF", "OBJ"],
    color: "from-cyan-500 to-blue-500",
  },
  {
    icon: Film,
    title: "Animation & VFX",
    description: "High-quality models with rigging support for animation",
    formats: ["FBX", "DAE", "GLTF"],
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Printer,
    title: "3D Printing",
    description: "Watertight meshes ready for slicing and printing",
    formats: ["STL", "OBJ"],
    color: "from-orange-500 to-red-500",
  },
  {
    icon: Globe,
    title: "Web & WebGL",
    description: "Optimized models for interactive web experiences",
    formats: ["GLTF", "GLB"],
    color: "from-green-500 to-teal-500",
  },
  {
    icon: Smartphone,
    title: "AR/VR",
    description: "Immersive content for augmented and virtual reality",
    formats: ["USDZ", "GLTF", "GLB"],
    color: "from-indigo-500 to-purple-500",
  },
  {
    icon: Cog,
    title: "CAD & Engineering",
    description: "Precise models for engineering and manufacturing",
    formats: ["OBJ", "STL"],
    color: "from-gray-500 to-slate-600",
  },
];

export const UseCasesSection = () => {
  return (
    <section id="formats" className="py-24 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-radial from-primary/10 to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Built for <span className="gradient-text">Every Use Case</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From indie game development to professional VFX studios, our exports are optimized for your workflow.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((useCase, index) => (
            <motion.div
              key={useCase.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="glass-card rounded-2xl p-6 h-full hover:border-primary/30 transition-all group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${useCase.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <useCase.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">{useCase.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{useCase.description}</p>
                <div className="flex flex-wrap gap-2">
                  {useCase.formats.map((format) => (
                    <span
                      key={format}
                      className="px-2 py-1 text-xs rounded-md bg-secondary text-muted-foreground"
                    >
                      {format}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
