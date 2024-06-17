import { FunctionComponent, useCallback } from "react";
import GroupComponent1 from "./GroupComponent1";
import GroupComponent from "./GroupComponent";

export type ActiveBetsType = {
  className?: string;
};

const ActiveBets: FunctionComponent<ActiveBetsType> = ({ className = "" }) => {

  const onGroupButtonClick = useCallback(() => {
    // Please sync "Bookies Markets Inner (Laptop) 3" to the project
  }, []);

  return (
    <div
      className={`w-[640px] h-[867px] flex flex-col items-start justify-start gap-[19.7px] text-left text-smi text-white font-inter ${className}`}
    >
      <button
        className="cursor-pointer [border:none] p-0 bg-[transparent] w-[640px] h-[260px] flex flex-row items-start justify-start max-w-full"
        onClick={onGroupButtonClick}
      >
        <GroupComponent1 />
      </button>
      <GroupComponent />
      <div className="w-[640px] h-[260px] rounded-xl bg-gray-200 flex flex-col items-end justify-start pt-4 px-[22px] pb-[23px] box-border gap-[21px] text-right">
        <div className="w-[640px] relative rounded-xl bg-gray-200 h-[260px] hidden" />
        <img
          className="w-6 relative rounded-[50%] h-6 object-contain hidden"
          alt=""
          src="/ellipse-14@2x.png"
        />
        <div className="w-[210px] h-4 flex flex-row items-start justify-start opacity-[0.8] z-[1]">
          <div className="h-4 w-[210px] relative font-medium inline-block">
            Bet closes 06/14 at 12:30 PM PST
          </div>
        </div>
        <div className="w-[593px] h-[184px] flex flex-row items-start justify-end py-0 pr-[9px] pl-0 box-border text-left text-5xl">
          <div className="h-[184px] w-[584px] flex flex-col items-end justify-start gap-[15.8px]">
            <div className="w-[583px] h-16 flex flex-row items-start justify-start gap-[24px]">
              <h2 className="m-0 h-16 w-[519px] relative text-inherit leading-[32px] font-medium font-inherit inline-block shrink-0 z-[3]">
                <p className="m-0">Who will win game 1 of Euros:</p>
                <p className="m-0">Germany or Scotland?</p>
              </h2>
              <div className="h-[52px] w-10 flex flex-col items-start justify-start pt-3 px-0 pb-0 box-border">
                <img
                  className="w-10 h-10 relative overflow-hidden shrink-0 z-[3]"
                  loading="lazy"
                  alt=""
                  src="/materialsymbolslightchevronright.svg"
                />
              </div>
            </div>
            <div className="w-[584px] h-3 rounded-xl bg-whitesmoke flex flex-row items-start justify-start z-[1]">
              <div className="w-[584px] relative rounded-xl bg-whitesmoke h-3 hidden" />
              <img
                className="h-3 w-[333px] relative z-[1]"
                loading="lazy"
                alt=""
                src="/rectangle-40830-2.svg"
              />
            </div>
            <div className="w-[584px] h-6 flex flex-row items-start justify-start gap-[234px] text-mini text-lightgray-100">
              <div className="h-6 w-[179px] flex flex-row items-start justify-start gap-[8px]">
                <img
                  className="h-6 w-6 relative rounded-[50%] object-cover z-[2]"
                  loading="lazy"
                  alt=""
                  src="/ellipse-14@2x.png"
                />
                <div className="h-[22px] w-[147px] flex flex-col items-start justify-start pt-[3px] px-0 pb-0 box-border">
                  <div className="w-[147px] h-[19px] relative uppercase inline-block z-[1]">
                    <b>GER</b>
                    <span className="font-semibold">{` `}</span>
                    <span className="font-medium">12,010 $DEGEN</span>
                  </div>
                </div>
              </div>
              <div className="h-6 w-[171px] flex flex-row items-start justify-start gap-[7px] text-right">
                <div className="h-[22px] w-[140px] flex flex-col items-start justify-start pt-[3px] px-0 pb-0 box-border">
                  <div className="w-[140px] h-[19px] relative uppercase inline-block z-[3]">
                    <b>SCO</b>
                    <span className="font-semibold">{` `}</span>
                    <span className="font-medium">8,178 $DEGEN</span>
                  </div>
                </div>
                <img
                  className="h-6 w-6 relative rounded-[50%] object-cover z-[3]"
                  loading="lazy"
                  alt=""
                  src="/ellipse-14@2x.png"
                />
              </div>
            </div>
            <div className="w-[585px] h-px relative box-border z-[1] border-t-[1px] border-solid border-darkslategray-200" />
            <div className="w-[583px] h-5 flex flex-row items-start justify-start gap-[186px] text-right text-smi text-whitesmoke">
              <div className="h-[18px] w-[237px] flex flex-col items-start justify-start pt-0.5 px-0 pb-0 box-border">
                <div className="w-[237px] h-4 flex flex-row items-start justify-start gap-[10px]">
                  <div className="h-4 w-[77px] relative font-medium inline-block z-[1]">
                    Bettors: 729
                  </div>
                  <div className="h-[11px] w-1.5 flex flex-col items-start justify-start pt-[5px] px-0 pb-0 box-border">
                    <div className="w-1.5 h-1.5 relative rounded-[50%] bg-slategray z-[1]" />
                  </div>
                  <div className="h-4 w-[134px] relative font-medium inline-block z-[1]">
                    Total: 20188 $DEGEN
                  </div>
                </div>
              </div>
              <div className="h-5 w-40 flex flex-row items-start justify-start gap-[8px] text-lightgray-200">
                <img
                  className="h-5 w-5 relative rounded-[50%] object-cover z-[1]"
                  loading="lazy"
                  alt=""
                  src="/ellipse-11-2@2x.png"
                />
                <div className="h-[18px] w-[132px] flex flex-col items-start justify-start pt-0.5 px-0 pb-0 box-border">
                  <div className="w-[132px] h-4 relative font-medium inline-block z-[1]">
                    Created by @neos88
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveBets;
