import { FunctionComponent } from "react";

export type GroupComponentType = {
  className?: string;
};

const GroupComponent: FunctionComponent<GroupComponentType> = ({
  className = "",
}) => {
  return (
    <div
      className={`w-[640px] h-[260px] rounded-xl flex flex-col items-start justify-start pt-[15px] pb-[23px] pr-[22px] pl-[25px] box-border relative gap-[16px] text-left text-smi text-white font-inter ${className}`}
    >
      <div className="w-[640px] h-[260px] absolute !m-[0] top-[0px] left-[calc(50%_-_320px)] rounded-xl bg-gray-200 z-[0]" />
      <div className="w-[593px] h-[22px] flex flex-row items-start justify-start pt-0 pb-1.5 pr-0 pl-[389px] box-border text-right">
        <div className="h-4 w-[204px] flex flex-row items-start justify-start opacity-[0.8] z-[1]">
          <div className="h-4 w-[204px] relative font-medium inline-block">
            Bet closes 06/16 at 5:00 PM PST
          </div>
        </div>
      </div>
      <div className="w-[584px] h-16 flex flex-row items-start justify-start py-0 pr-0 pl-px box-border text-5xl">
        <div className="h-16 w-[583px] flex flex-row items-start justify-start gap-[61px]">
          <h2 className="m-0 h-16 w-[482px] relative text-inherit leading-[32px] font-medium font-inherit inline-block shrink-0 z-[1]">
            What team will win the NHL Stanley Cup Oilers or Panthers?
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
      <div className="w-[584px] h-[104px] flex flex-col items-end justify-start gap-[15.7px] text-mini text-lightgray-100">
        <div className="w-[584px] h-3 rounded-xl bg-whitesmoke flex flex-row items-start justify-start z-[1]">
          <div className="w-[584px] relative rounded-xl bg-whitesmoke h-3 hidden" />
          <img
            className="h-3 w-[244px] relative z-[1]"
            loading="lazy"
            alt=""
            src="/rectangle-40830-1.svg"
          />
        </div>
        <div className="w-[584px] h-6 flex flex-row items-start justify-start gap-[162px]">
          <div className="h-6 w-[199px] flex flex-row items-start justify-start gap-[12px]">
            <img
              className="h-6 w-6 relative rounded-[50%] object-cover z-[1]"
              loading="lazy"
              alt=""
              src="/ellipse-12@2x.png"
            />
            <div className="h-[22px] w-[163px] flex flex-col items-start justify-start pt-[3px] px-0 pb-0 box-border">
              <div className="w-[163px] h-[19px] relative uppercase inline-block z-[1]">
                <b>OILERS</b>
                <span className="font-semibold">{` `}</span>
                <span className="font-medium">4,810 $DEGEN</span>
              </div>
            </div>
          </div>
          <div className="h-6 w-[223px] flex flex-row items-start justify-start gap-[11px] text-right">
            <div className="h-[22px] w-[188px] flex flex-col items-start justify-start pt-[3px] px-0 pb-0 box-border">
              <div className="w-[188px] h-[19px] relative uppercase inline-block z-[1]">
                <b>PANTHERS</b>
                <span className="font-semibold">{` `}</span>
                <span className="font-medium">9,175 $DEGEN</span>
              </div>
            </div>
            <img
              className="h-6 w-6 relative rounded-[50%] object-cover z-[1]"
              loading="lazy"
              alt=""
              src="/ellipse-13@2x.png"
            />
          </div>
        </div>
        <div className="w-[585px] h-px relative box-border z-[1] border-t-[1px] border-solid border-darkslategray-200" />
        <div className="w-[583px] h-5 flex flex-row items-start justify-start gap-[185px] text-right text-smi text-whitesmoke">
          <div className="h-[18px] w-[238px] flex flex-col items-start justify-start pt-0.5 px-0 pb-0 box-border">
            <div className="w-[238px] h-4 flex flex-row items-start justify-start gap-[10px]">
              <div className="h-4 w-[78px] relative font-medium inline-block z-[1]">
                Bettors: 804
              </div>
              <div className="h-[11px] w-1.5 flex flex-col items-start justify-start pt-[5px] px-0 pb-0 box-border">
                <div className="w-1.5 h-1.5 relative rounded-[50%] bg-slategray z-[1]" />
              </div>
              <div className="h-4 w-[134px] relative font-medium inline-block z-[1]">
                Total: 13985 $DEGEN
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
  );
};

export default GroupComponent;
