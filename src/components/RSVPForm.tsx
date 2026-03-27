import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import confetti from "canvas-confetti";
import { Users, Phone, Heart, CheckCircle2, Edit2, Trash2 } from "lucide-react";
import { useRSVP, rsvpSchema, type RSVPFormData } from "@/lib/queries";

export const RSVPForm = () => {
  const { rsvp, isSubmitting, isDeleting, submitRSVP, deleteRSVP, isLoading } =
    useRSVP();
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RSVPFormData>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: { name: "", phoneNumber: "", guestsCount: 1 },
  });

  // Sync form when data loads or reset is needed
  useEffect(() => {
    if (rsvp) reset(rsvp);
  }, [rsvp, reset]);

  const onSubmit = async (data: RSVPFormData) => {
    try {
      await submitRSVP(data);
      setIsEditing(false); // Close edit mode on success
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#D4AF37", "#77DD77", "#FFFFFF"],
      });
    } catch (err) {
      console.error("Submission failed", err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to remove your RSVP?")) {
      await deleteRSVP();
      reset({ name: "", phoneNumber: "", guestsCount: 1 });
      setIsEditing(false);
    }
  };

  if (isLoading)
    return (
      <div className="py-32 text-center text-gold-500 font-bold italic">
        Checking RSVP status...
      </div>
    );

  return (
    <section
      id="rsvp"
      className="py-32 px-6 relative bg-white/10 backdrop-blur-sm z-10"
    >
      <div className="max-w-md mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white/80 backdrop-blur-md p-10 rounded-[2.5rem] shadow-xl border border-gold-500/20 relative overflow-hidden"
        >
          <div className="text-center mb-10">
            <Heart
              className="text-gold-500 mx-auto mb-6 fill-gold-500/10"
              size={48}
            />
            <h2 className="text-4xl font-bold text-gold-500 mb-3 italic">
              RSVP
            </h2>
            <p className="text-black italic">
              Your presence would mean the world to us.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {rsvp && !isEditing ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                  <CheckCircle2
                    className="text-green-500 mx-auto mb-6"
                    size={80}
                  />
                </motion.div>
                <h3 className="text-2xl font-bold mb-4 text-black">
                  Alhamdulillah!
                </h3>
                <p className="text-black leading-relaxed italic mb-8">
                  Jazak Allah Khair<b> {rsvp.name}! </b> We have you down for{" "}
                  <b>
                    {rsvp.guestsCount}{" "}
                    {rsvp.guestsCount === 1 ? "guest" : "guests"}
                  </b>
                  .
                </p>

                <div className="flex gap-3 justify-center mt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2 bg-white text-black border border-gold-500/30 px-6 py-3 rounded-xl shadow-sm hover:shadow-md transition-all font-bold text-sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 size={18} className="text-gold-500" /> Edit
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isDeleting}
                    className="inline-flex items-center gap-2 bg-white text-black border border-gold-500/30 px-6 py-3 rounded-xl shadow-sm hover:shadow-md transition-all font-bold text-sm"
                    onClick={handleDelete}
                  >
                    <Trash2 size={18} className="text-gold-500" />{" "}
                    {isDeleting ? "Removing..." : "Delete"}
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* NAME INPUT */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-black uppercase tracking-widest ml-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <Users
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-gold-500/50"
                      size={18}
                    />
                    <input
                      {...register("name")}
                      placeholder="e.g. Sharifah Nadhirah"
                      className="w-full pl-12 pr-4 py-4 rounded-full border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-gold-500 outline-none transition-all text-black"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-red-500 text-[10px] font-bold uppercase ml-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* PHONE INPUT */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-black uppercase tracking-widest ml-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-gold-500/50"
                      size={18}
                    />
                    <input
                      {...register("phoneNumber")}
                      type="tel"
                      maxLength={8}
                      placeholder="e.g. 81234567"
                      className="w-full pl-12 pr-4 py-4 rounded-full border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-gold-500 outline-none transition-all text-black"
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p className="text-red-500 text-[10px] font-bold uppercase ml-1">
                      {errors.phoneNumber.message}
                    </p>
                  )}
                </div>

                {/* GUESTS SELECT */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-black uppercase tracking-widest ml-1">
                    Guests
                  </label>
                  <div className="relative">
                    <Users
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-gold-500/50"
                      size={18}
                    />
                    <select
                      {...register("guestsCount", { valueAsNumber: true })}
                      className="w-full pl-12 pr-4 py-4 rounded-full border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-gold-500 outline-none text-black appearance-none"
                    >
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? "Person" : "People"} Total
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-b from-gold-500 to-gold-600 text-white py-4 rounded-full font-bold shadow-lg disabled:opacity-70 uppercase tracking-widest text-sm"
                  >
                    {isSubmitting
                      ? "Sending Love..."
                      : isEditing
                        ? "Update RSVP"
                        : "Confirm Attendance"}
                  </motion.button>

                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="text-xs font-bold text-gray-400 uppercase tracking-widest"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* FOOTER BRIDE & GROOM SECTION RESTORED */}
      <div className="py-6 text-center text-black text-sm px-6 relative z-10 mx-auto">
        <div className="w-12 h-px bg-gold-500/30 mx-auto mb-8" />
        <p className="mb-4 italic">With love and prayers,</p>
        <h2 className="font-bold text-white [text-shadow:_2px_2px_0_rgb(212_175_55),_-2px_-2px_0_rgb(212_175_55),_2px_-2px_0_rgb(212_175_55),_-2px_2px_0_rgb(212_175_55)] text-3xl italic">
          Danish & Nadhirah
        </h2>
        <div className="-mt-10 mb-4">
          <img
            className="w-full max-w-lg aspect-square object-contain mx-auto"
            src="/dannad.png"
            alt="dannad"
          />
        </div>
        <div className="opacity-60 text-[10px] uppercase tracking-[0.3em]">
          <p>© 2026 Dannad Wedding</p>
        </div>
      </div>
    </section>
  );
};
