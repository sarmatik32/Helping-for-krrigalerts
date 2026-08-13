import React from "react";
import { Shield, Radio, Wifi, Zap, CheckCircle, AlertTriangle } from "lucide-react";

export const EquipmentMatrix: React.FC = () => {
  const items = [
    {
      id: "1",
      name: "Детектор дронів «Щезник 4М»",
      category: "Портативний засіб РЕР / Аналізатор",
      price: "від 45,000 грн",
      status: "Основна ціль збору",
      statusColor: "bg-emerald-950 text-emerald-400 border-emerald-700/60",
      description: "Всеспрямований аналізатор радіочастотного спектру для виявлення відеосигналів FPV-дронів та розвідувальних БПЛА.",
      specs: ["Диапазон: 800 - 6000 МГц", "Дальність виявлення: до 3.5 км", "Час автономної роботи: 8+ годин", "Звукове та вібро-оповіщення"]
    },
    {
      id: "2",
      name: "Детектор частот «Чуйка 3 / Хантер»",
      category: "Сканер відеоканалу FPV",
      price: "від 38,000 грн",
      status: "Пріоритет 1",
      statusColor: "bg-sky-950 text-sky-400 border-sky-700/60",
      description: "Компактний приймач з кольоровим екраном для візуального перехоплення відеосигналу з ворожих FPV-дронів у реальному часі.",
      specs: ["Перехоплення відео 1.2 / 2.4 / 5.8 ГГц", "Захищений ударостійкий корпус", "Швидка заміна акумуляторів", "Кріплення на спорядження MOLLE"]
    },
    {
      id: "3",
      name: "Напрямні антени та підсилювачі",
      category: "Комплектуючі для РЕР",
      price: "12,000 - 18,000 грн",
      status: "Додатковий комплект",
      statusColor: "bg-amber-950 text-amber-400 border-amber-700/60",
      description: "Виносні логоперіодичні антени для збільшення дальності раннього виявлення та визначення точного напрямку на дрон.",
      specs: ["Підсилення до +12 dBi", "Кабель LMR-400 з низькими втратами", "Герметичні роз'єми SMA", "Штатив для стаціонарного поста"]
    }
  ];

  return (
    <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-md my-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2.5 text-cyan-400 font-bold">
            <Radio className="w-5 h-5 text-sky-400" />
            <h2 className="text-xl text-white font-bold tracking-tight">
              Обладнання РЕР / РЕБ для закупівлі
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Необхідні засоби радіоелектронної розвідки для захисту бійців на передньому краї
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-950 text-sky-300 border border-sky-800 text-xs font-mono font-bold">
          <Zap className="w-3.5 h-3.5" />
          <span>Потреба розвідроти</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl p-5 flex flex-col justify-between transition-all duration-200 relative group hover:shadow-lg"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className={`text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full border ${item.statusColor}`}>
                  {item.status}
                </span>
                <span className="text-xs font-bold text-slate-300 font-mono">
                  {item.price}
                </span>
              </div>

              <h3 className="text-base font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">
                {item.name}
              </h3>

              <p className="text-xs font-mono text-cyan-400/80 mb-3">
                {item.category}
              </p>

              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {item.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-400 font-mono">
              {item.specs.map((spec, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-[11px]">{spec}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
