import { ReactNode } from "react";
import { LogoText } from "@/components/logos/logo-text";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style>
        {`
          .branded-bg {
            background-image: url('/media/images/2600x1600/1.png');
          }
          .dark .branded-bg {
            background-image: url('/media/images/2600x1600/1-dark.png');
          }
        `}
      </style>
      <div className="grid lg:grid-cols-2 grow">
        <div className="flex justify-center items-center p-8 lg:p-10 order-2 lg:order-1">
          {children}
        </div>

        <div className="bg-background lg:rounded-xl lg:border lg:border-border lg:m-5 order-1 lg:order-2 bg-top xxl:bg-center xl:bg-cover bg-no-repeat branded-bg">
          <div className="flex flex-col p-8 lg:p-16 gap-10">
            <LogoText />
            <div className="flex flex-col gap-3">
              <h3 className="text-2xl font-semibold text-mono">Accounting Software</h3>
              {/* <div className="text-base font-medium text-secondary-foreground">
                A robust accounting software ensuring
                <br /> secure&nbsp;
                <span className="text-mono font-semibold">efficient accounting</span>
                &nbsp;to the RSI
                <br /> Accounting interface.
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
