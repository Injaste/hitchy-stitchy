import { motion } from "framer-motion";
import {
  Calendar,
  CalendarCheck,
  Clock,
  MapPin,
  MapPinCheck,
  Sparkles,
} from "lucide-react";

export const Details = () => {
  const detailsList = [
    { icon: Calendar, title: "Date", detail: "4th July 2026", sub: "Saturday" },
    { icon: Clock, title: "Time", detail: "10:00 AM", sub: "to 4:00 PM" },
    {
      icon: MapPin,
      title: "Location",
      detail: "De Hall Pte Ltd",
      sub: "Tai Seng, Singapore",
    },
  ];

  const googleCalendarUrl =
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    "&text=" +
    encodeURIComponent("Wedding of Danish & Nadhirah") +
    "&dates=20260704T020000Z/20260704T080000Z" +
    "&location=" +
    encodeURIComponent(
      "De Hall Pte Ltd, 3 Irving Rd, #02-10, Singapore 369522",
    );

  return (
    <section
      id="details"
      className="py-32 px-6 bg-white/60 backdrop-blur-sm relative z-10"
    >
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-24"
        >
          <Sparkles className="text-gold-500 mx-auto mb-6" size={32} />
          <h3 className="text-4xl font-bold text-gold-500 mb-6 italic">
            A Journey of Love
          </h3>
          <p className="text-lg text-black leading-relaxed max-w-2xl mx-auto italic">
            "In the name of Allah, the Most Gracious, the Most Merciful. We
            invite you to witness the beginning of our forever. A day where two
            souls become one, guided by faith and bound by love."
          </p>
        </motion.div>

        <div className="mb-20">
          <p className="text-black mb-4 uppercase tracking-[0.4em] text-xs font-bold">
            With the blessings of
          </p>
          <h3 className="text-3xl md:text-4xl font-bold text-gold-500 mb-2">
            Shaik & Nazreen
          </h3>
          <p className="text-black italic">Parents of the Bride</p>
          <div className="w-16 h-px bg-gold-500/30 mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {detailsList.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.6 }}
              className="group flex flex-col items-center"
            >
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-gold-500 mb-6 group-hover:scale-110 transition-transform duration-500 shadow-sm border border-gold-500/20">
                <item.icon size={32} />
              </div>
              <h4 className="font-bold text-xl mb-2 text-black">
                {item.title}
              </h4>
              <p className="text-gold-500 font-bold text-lg">{item.detail}</p>
              <p className="text-black text-sm italic">{item.sub}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 mb-10"
        >
          <motion.a
            href={googleCalendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 bg-white text-black border border-gold-500/30 px-6 py-3 rounded-xl shadow-sm hover:shadow-md transition-all font-bold text-sm tracking-wide uppercase"
          >
            <CalendarCheck size={18} className="text-gold-500" />
            ADD TO GOOGLE CALENDAR
          </motion.a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-col mt-20 p-4 w-full max-w-xl mx-auto aspect-square rounded-3xl bg-white/50 border border-gold-500/10 overflow-hidden"
        >
          <div className="h-full w-full rounded-2xl overflow-hidden mb-6">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.7341039563585!2d103.8844618123356!3d1.3357613986459655!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da1773cb7e8e69%3A0xd35a6227ea3210d4!2sDe%20Hall%20Restaurant!5e0!3m2!1sen!2ssg!4v1774334382426!5m2!1sen!2ssg"
              width="600"
              height="450"
              style={{
                border: 0,
              }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
          <p className="text-black italic">
            3 Irving Rd, #02-10, Singapore 369522
          </p>

          <motion.a
            href="https://maps.app.goo.gl/JBUozdjuYPFsv7KE6"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-fit mx-auto mt-4 inline-flex items-center gap-2 bg-white text-black border border-gold-500/30 px-6 py-3 rounded-xl shadow-sm hover:shadow-md transition-all font-bold text-sm tracking-wide uppercase"
          >
            <MapPinCheck size={18} className="text-gold-500" />
            View on Google Maps
          </motion.a>
        </motion.div>
      </div>

      <motion.a
        href="#rsvp"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="block w-fit mt-12 mx-auto bg-gold-500 text-white px-12 py-4 rounded-full shadow-lg hover:bg-gold-600 transition-all uppercase tracking-widest text-sm font-bold border-2 border-white/20"
      >
        RSVP NOW
      </motion.a>
    </section>
  );
};
