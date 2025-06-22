// Card.tsx (simplified)
import card from '../assets/card1.png';

interface CardProps {
  name: string;
  total: number;
  income: number;
  expense: number;
}

const Card: React.FC<CardProps> = ({
  name,
  total,
  income,
  expense,
}) => {
  return (
    <div className="relative w-full overflow-hidden rounded-lg shadow">
      <img src={card} alt="Card" className="w-full h-full object-cover" />
      <div className="absolute top-0 w-full h-full flex flex-col justify items-start pl-8 py-4">
        <h3 className="text-lg font-semibold text-white">Total Balance</h3>
        <p className="text-2xl font-bold">₱{total}</p>
      </div>
      <div className="absolute top-0 w-full h-full flex flex-col justify items-start pl-8 py-26">
        <h3 className="text-lg font-semibold text-white">Income</h3>
        <p className="text-2xl font-bold">₱{income}</p>
      </div>
      <div className="absolute top-0 w-full h-full flex flex-col justify items-end pr-8 py-26">
        <h3 className="text-lg font-semibold text-white">Expense</h3>
        <p className="text-2xl font-bold">₱{expense}</p>
      </div>
      <p className="text-2xl font-bold mt-3">{name}</p>
    </div>
  );
};

export default Card;
