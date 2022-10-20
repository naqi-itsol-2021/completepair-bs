import { ExclamationIcon } from "@heroicons/react/solid";
import { SchedulingType } from "@prisma/client";
import { Dayjs } from "dayjs";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { FC, useEffect, useState } from "react";

import classNames from "@lib/classNames";
import { useLocale } from "@lib/hooks/useLocale";
import { useSlots } from "@lib/hooks/useSlots";

import Loader from "@components/Loader";

type AvailableTimesProps = {
  timeFormat: string;
  minimumBookingNotice: number;
  eventTypeId: number;
  eventLength: number;
  slotInterval: number | null;
  date: Dayjs;
  users: {
    username: string | null;
    id: number | null;
  }[];
  schedulingType: SchedulingType | null;
};

const AvailableTimes: FC<AvailableTimesProps> = ({
  date,
  eventLength,
  eventTypeId,
  slotInterval,
  minimumBookingNotice,
  timeFormat,
  users,
  schedulingType,
}) => {
  const { t, i18n } = useLocale();
  const router = useRouter();
  const { rescheduleUid } = router.query;

  const { slots, loading, error } = useSlots({
    date,
    slotInterval,
    eventLength,
    schedulingType,
    users,
    minimumBookingNotice,
    eventTypeId,
  });

  const [brand, setBrand] = useState("#292929");
  const [timeslot, setTimeslot] = useState([]);

  function isInArray(array, value) {
    return !!array.find((item) => {
      return item.getTime() == value.getTime();
    });
  }
  const getTimeslot = async () => {
    console.log("user ka data chaye he", users);
    const getBookingTimes = await fetch("/api/booking", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsImVtYWlsIjoibmFxaTExMjI0NEBnbWFpbC5jb20iLCJpYXQiOjE2NDYzMDI1OTl9.0FMyDDPvPLfFmJlccPU8y2UVI5mPI8AL4p6xP2t9_ltvHls_-WeLiY5aCeXANxFBP_W2VCWXoZ6tZIylUJnquQ",
      },
      body: JSON.stringify({ date: new Date(date), selectedmemberid: users[0].id }),
    });
    const Bokingdata = await getBookingTimes.json();
    console.log("datees", Bokingdata);
    const arr = [];
    Bokingdata.Bookings.map((x) => {
      arr.push(new Date(x.startTime));
    });
    setTimeslot(arr);
  };

  useEffect(() => {
    getTimeslot();
  }, []);
  useEffect(() => {
    setBrand(getComputedStyle(document.documentElement).getPropertyValue("--brand-color").trim());
  }, []);

  return (
    <div className="flex flex-col mt-8 text-center sm:pl-4 sm:mt-0 sm:w-1/3 md:-mb-5">
      <div className="mb-4 text-lg font-light text-left text-gray-600">
        <span className="w-1/2 text-gray-600 dark:text-white">
          <strong>{date.toDate().toLocaleString(i18n.language, { weekday: "long" })}</strong>
          <span className="text-gray-500">
            {date.format(", D ")}
            {date.toDate().toLocaleString(i18n.language, { month: "long" })}
          </span>
        </span>
      </div>
      <div className="flex-grow md:h-[364px] overflow-y-auto">
        {!loading &&
          slots?.length > 0 &&
          slots.map((slot) => {
            type BookingURL = {
              pathname: string;
              query: Record<string, string | number | string[] | undefined>;
            };
            const bookingUrl: BookingURL = {
              pathname: "book",
              query: {
                ...router.query,
                date: slot.time.format(),
                type: eventTypeId,
              },
            };

            if (rescheduleUid) {
              bookingUrl.query.rescheduleUid = rescheduleUid as string;
            }

            if (schedulingType === SchedulingType.ROUND_ROBIN) {
              bookingUrl.query.user = slot.users;
            }
            const d_time = slot.time.format(timeFormat);
            let jhg = new Date(slot.time.format());

            const found = isInArray(timeslot, new Date(slot.time.format()));

            return (
              <div key={slot.time.format()}>
                <Link href={found ? "#" : bookingUrl}>
                  <a
                    className={classNames(
                      "block py-4 mb-2 font-medium bg-white border rounded-sm dark:bg-gray-600 text-primary-500 dark:text-neutral-200 dark:border-transparent hover:text-white hover:bg-brand hover:text-brandcontrast dark:hover:border-black dark:hover:bg-brand dark:hover:text-brandcontrast",
                      brand === "#fff" || brand === "#ffffff" ? "border-brandcontrast" : "border-brand"
                    )}
                    data-testid="time">
                    {found ? "Booked" + " " + d_time : d_time}
                  </a>
                </Link>
              </div>
            );
          })}
        {!loading && !error && !slots.length && (
          <div className="flex flex-col items-center content-center justify-center w-full h-full -mt-4">
            <h1 className="my-6 text-xl text-black dark:text-white">{t("all_booked_today")}</h1>
          </div>
        )}

        {loading && <Loader />}

        {error && (
          <div className="p-4 border-l-4 border-yellow-400 bg-yellow-50">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationIcon className="w-5 h-5 text-yellow-400" aria-hidden="true" />
              </div>
              <div className="ltr:ml-3 rtl:mr-3">
                <p className="text-sm text-yellow-700">{t("slots_load_fail")}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailableTimes;
