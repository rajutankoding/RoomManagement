import PricingCard from "@/components/PricingCard";
import SearchInputComponent from "@/components/SearchInputComponent";
import Image from "next/image";
import React from "react";

const page = () => {
  return (
    <div>
      <SearchInputComponent />
      <div className="flex flex-wrap justify-center ">
        <PricingCard
          cModal={
            <div>
              <ul className="list bg-base-100 rounded-box shadow-md">
                <li className="">
                  <button className="btn btn-sm btn-success btn-block">
                    Add Items +
                  </button>
                </li>
                <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">
                  Additional Orders
                </li>

                <li className="list-row">
                  <div className="text-4xl font-thin opacity-30 tabular-nums">
                    01
                  </div>
                  <div>
                    <img
                      className="size-10 rounded-box"
                      src="https://img.daisyui.com/images/profile/demo/1@94.webp"
                    />
                  </div>
                  <div className="list-col-grow">
                    <div>Dio Lupa</div>
                    <div className="text-xs uppercase font-semibold opacity-60">
                      Remaining Reason
                    </div>
                  </div>
                  <div className="badge badge-soft badge-secondary">
                    Include
                  </div>
                </li>

                <li className="list-row">
                  <div className="text-4xl font-thin opacity-30 tabular-nums">
                    02
                  </div>
                  <div>
                    <img
                      className="size-10 rounded-box"
                      src="https://img.daisyui.com/images/profile/demo/4@94.webp"
                    />
                  </div>
                  <div className="list-col-grow">
                    <div>Ellie Beilish</div>
                    <div className="text-xs uppercase font-semibold opacity-60">
                      Bears of a fever
                    </div>
                  </div>
                  <button className="btn btn-square btn-ghost">
                    <svg
                      className="size-[1.2em]"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24">
                      <g
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        strokeWidth="2"
                        fill="none"
                        stroke="currentColor">
                        <path d="M6 3L20 12 6 21 6 3z"></path>
                      </g>
                    </svg>
                  </button>
                </li>

                <li className="list-row">
                  <div className="text-4xl font-thin opacity-30 tabular-nums">
                    03
                  </div>
                  <div>
                    <img
                      className="size-10 rounded-box"
                      src="https://img.daisyui.com/images/profile/demo/3@94.webp"
                    />
                  </div>
                  <div className="list-col-grow">
                    <div>Sabrino Gardener</div>
                    <div className="text-xs uppercase font-semibold opacity-60">
                      Cappuccino
                    </div>
                  </div>
                  <button className="btn ">
                    <Image
                      height={20}
                      width={20}
                      src="/edit-text.png"
                      alt="Edit"
                    />
                  </button>
                </li>
              </ul>
              <div className="justify-between flex mt-4">
                <a className="font-mono font-thin">Total : RP. 50.000,00</a>
                <button className="btn btn-sm btn-info btn-dash">
                  Close Bill
                </button>
              </div>
            </div>
          }
          tModal={"Billing Table 1"}
          tButton={"Bill"}
        />
      </div>
    </div>
  );
};

export default page;
