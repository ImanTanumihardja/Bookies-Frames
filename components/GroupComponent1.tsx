import { FunctionComponent } from "react";

export type GroupComponent1Type = {
  className?: string;
};

const GroupComponent1: FunctionComponent<GroupComponent1Type> = ({
  className = "",
}) => {
  return (
    <div
      className={`h-[260px] w-[640px] rounded-xl bg-gray-200 flex flex-col items-end justify-start py-[19px] px-[22px] box-border gap-[16px] text-left text-smi text-white font-inter ${className}`}
    >
      <div className="w-[640px] relative rounded-xl bg-gray-200 h-[260px] hidden" />
      <div className="w-[204px] h-[22px] flex flex-row items-start justify-start pt-0 px-0 pb-1.5 box-border text-right">
        <div className="h-4 w-[204px] flex flex-row items-start justify-start opacity-[0.8] z-[1]">
          <div className="h-4 w-[204px] relative font-medium inline-block">
            Bet closes 06/17 at 4:00 PM PST
          </div>
        </div>
      </div>
      <div className="w-[593px] h-16 flex flex-row items-start justify-end py-0 pr-2.5 pl-0 box-border text-5xl">
        <div className="h-16 w-[583px] flex flex-row items-start justify-start gap-[61px]">
          <h2 className="m-0 h-16 w-[482px] relative text-inherit leading-[32px] font-medium font-inherit inline-block shrink-0 z-[1]">
            Who will win Game 4: Celtics or Mavericks?
          </h2>
          <div className="h-[52px] w-10 flex flex-col items-start justify-start pt-3 px-0 pb-0 box-border">
            <img
              className="w-10 h-10 relative overflow-hidden shrink-0 z-[1]"
              loading="lazy"
              alt=""
              src="/materialsymbolslightchevronright.svg"
            />
          </div>
        </div>
      </div>
      <div className="w-[596px] h-[104px] flex flex-row items-start justify-end py-0 pr-2.5 pl-0 box-border text-mini text-lightgray-100">
        <div className="h-[104px] w-[586px] flex flex-col items-end justify-start gap-[12px]">
          <div className="w-[584px] h-3 rounded-xl bg-whitesmoke flex flex-row items-start justify-start z-[1]">
            <div className="w-[584px] relative rounded-xl bg-whitesmoke h-3 hidden" />
            <img
              className="h-3 w-[394px] relative z-[1]"
              loading="lazy"
              alt=""
              src="/rectangle-40830.svg"
            />
          </div>
          <div className="w-[586px] h-[30px] flex flex-row items-start justify-start gap-[176px]">
            <div className="h-[30px] w-[220px] flex flex-col items-start justify-start pt-0.5 px-0 pb-0 box-border">
              <div className="w-[220px] h-7 flex flex-row items-start justify-start gap-[10px]">
                <img
                  className="h-7 w-7 relative overflow-hidden shrink-0 object-cover z-[1]"
                  loading="lazy"
                  alt=""
                  src="/boston-celtics-logo@2x.png"
                />
                <div className="h-[23px] w-[182px] flex flex-col items-start justify-start pt-[5px] px-0 pb-0 box-border">
                  <div className="w-[182px] h-[18px] relative uppercase inline-block z-[1]">
                    <b>Celtics</b>
                    <span className="font-semibold">{` `}</span>
                    <span className="font-medium">13,435 $DEGEN</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-7 w-[190px] flex flex-row items-start justify-start gap-[7px] text-right">
              <div className="h-6 w-[155px] flex flex-col items-start justify-start pt-[5px] px-0 pb-0 box-border">
                <div className="w-[155px] h-[19px] relative uppercase inline-block z-[1]">
                  <b>mavs</b>
                  <span className="font-semibold">{` `}</span>
                  <span className="font-medium">9,976 $DEGEN</span>
                </div>
              </div>
              <img
                className="h-7 w-7 relative overflow-hidden shrink-0 z-[1]"
                loading="lazy"
                alt=""
                src="/dallas-mavericks-logo.svg"
              />
            </div>
          </div>
          <div className="w-[584px] h-[5px] flex flex-row items-start justify-start pt-0 px-0 pb-1 box-border">
            <div className="h-px w-[585px] relative box-border z-[1] border-t-[1px] border-solid border-darkslategray-200" />
          </div>
          <div className="w-[583px] h-5 flex flex-row items-start justify-start gap-[187px] text-right text-smi text-whitesmoke">
            <div className="h-[18px] w-[236px] flex flex-col items-start justify-start pt-0.5 px-0 pb-0 box-border">
              <div className="w-[236px] h-4 flex flex-row items-start justify-start gap-[10px]">
                <div className="h-4 w-[78px] relative font-medium inline-block z-[1]">
                  Bettors: 935
                </div>
                <div className="h-[11px] w-1.5 flex flex-col items-start justify-start pt-[5px] px-0 pb-0 box-border">
                  <div className="w-1.5 h-1.5 relative rounded-[50%] bg-slategray z-[1]" />
                </div>
                <div className="h-4 w-[132px] relative font-medium inline-block z-[1]">
                  Total: 23411 $DEGEN
                </div>
              </div>
            </div>
            <div className="h-5 w-40 flex flex-row items-start justify-start gap-[8px] text-lightgray-200">
              <img
                className="h-5 w-[18px] relative rounded-[50%] object-cover z-[1]"
                loading="lazy"
                alt=""
                src="/ellipse-11@2x.png"
              />
              <div className="h-[18px] w-[134px] flex flex-col items-start justify-start pt-0.5 px-0 pb-0 box-border">
                <div className="w-[134px] h-4 relative font-medium inline-block z-[1]">
                  Created by @bookies
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupComponent1;
