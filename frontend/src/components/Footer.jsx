import React from "react";
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';

function Footer(){
    const currentYear = new Date().getFullYear();
    return(
        <motion.footer 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 py-10 relative overflow-hidden"
        >
          {/* A cute waving background or soft color base */}
          <div className="absolute inset-0 bg-gradient-to-t from-kawaii-secondary/20 to-transparent -z-10" />
          
          <div className="container mx-auto px-4 flex flex-col items-center justify-center text-kawaii-text-dark gap-2">
            <p className="font-semibold text-lg flex items-center gap-2">
              Built with <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}><Heart className="w-5 h-5 text-kawaii-error fill-kawaii-error" /></motion.div> for anime lovers.
            </p>
            <p className="text-sm opacity-80">&copy; {currentYear} Sensei Suggest. All kawaii rights reserved 🌸</p>
          </div>
        </motion.footer>
    )
}

export default Footer;