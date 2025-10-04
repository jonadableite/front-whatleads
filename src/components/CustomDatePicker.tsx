import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CustomDatePickerProps {
	selectedDate: Date;
	onChange: (date: Date) => void;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
	selectedDate,
	onChange,
}) => {
	const [isOpen, setIsOpen] = useState(false);

	const toggleCalendar = () => setIsOpen(!isOpen);

	return (
		<div className="relative">
			<motion.button
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.95 }}
				onClick={toggleCalendar}
				className="flex items-center space-x-2 bg-electric/50 text-gray-400 hover:bg-blue-500/40 transition-colors px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
			>
				<Calendar className="w-5 h-5 text-gray-400" />
				<span className="text-gray-400">{format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}</span>
			</motion.button>
			{isOpen && (
				<motion.div
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -10 }}
					transition={{ duration: 0.2 }}
					className="absolute z-10 mt-2"
				>
					<DatePicker
						selected={selectedDate}
						onChange={(date: Date | null) => {
							if (date) {
								onChange(date);
								setIsOpen(false);
							}
						}}
						inline
						calendarClassName="bg-deep border border-electric rounded-lg shadow-lg"
						dayClassName={(date) =>
							`text-white hover:bg-electric/30 rounded-full transition-colors ${date.toDateString() === new Date().toDateString()
								? "bg-electric/50 text-white"
								: ""
							}`
						}
						monthClassName={() => `text-electric font-bold`}
						weekDayClassName={() => `text-electric/70`}
						popperClassName="react-datepicker-popper"
					/>
				</motion.div>
			)}
		</div>
	);
};

export default CustomDatePicker;
