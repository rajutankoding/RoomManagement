import PricingCard from "@/components/PricingCard";

const datas = [
  {
    name: "Table  1",
    category: "Party",
    price: 50000,
  },
];
const page = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Rooms Management
      </h1>
      <button className="btn btn-primary btn-dash">Add +</button>
      <div className="flex flex-wrap justify-center ">
        <PricingCard tButton={"Manage"} />
        <PricingCard tButton={"Manage"} />
        <PricingCard tButton={"Manage"} />
        <PricingCard tButton={"Manage"} />
        <PricingCard tButton={"Manage"} />
        <PricingCard tButton={"Manage"} />
        <PricingCard tButton={"Manage"} />
        <PricingCard tButton={"Manage"} />
        <PricingCard tButton={"Manage"} />
        <PricingCard tButton={"Manage"} />
      </div>
    </div>
  );
};

export default page;
