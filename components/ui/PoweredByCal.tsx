import Link from "next/link";

import { useLocale } from "@lib/hooks/useLocale";

const PoweredByCal = () => {
  const { t } = useLocale();
  return (
    <div className="p-1 text-xs text-center sm:text-right">
      <Link href={`https://completepairbooking.app?utm_source=embed&utm_medium=powered-by-button`}>
        <a target="_blank" className="text-gray-500 opacity-50 dark:text-white hover:opacity-100">
          {t("powered_by Completepairbooking.app")}{" "}
          {/* <img
            className="dark:hidden w-auto inline h-[10px] relative -mt-px"
            src=""
            alt="Cal.com Logo"
          />
          <img
            className="hidden dark:inline w-auto h-[10px] relativ -mt-px"
            src="https://cal.com/logo-white.svg"
            alt="Cal.com Logo"
          /> */}
        </a>
      </Link>
    </div>
  );
};

export default PoweredByCal;
