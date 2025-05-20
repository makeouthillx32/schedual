const CalendarBox = () => {
  // Common cell styling with CSS variables
  const cellClass = "ease relative h-20 cursor-pointer border border-[hsl(var(--border))] p-2 transition duration-500 hover:bg-[hsl(var(--muted))] dark:border-[hsl(var(--sidebar-border))] dark:hover:bg-[hsl(var(--secondary))] md:h-25 md:p-6 xl:h-31";
  
  // Common text styling
  const dayNumberClass = "font-medium text-[hsl(var(--foreground))] dark:text-[hsl(var(--card-foreground))]";
  
  return (
    <>
      <div className="w-full max-w-full rounded-[var(--radius)] bg-[hsl(var(--background))] shadow-[var(--shadow-sm)] dark:bg-[hsl(var(--card))] dark:shadow-[var(--shadow-md)]">
        <table className="w-full">
          <thead>
            <tr className="grid grid-cols-7 rounded-t-[var(--radius)] bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]">
              <th className="flex h-15 items-center justify-center rounded-tl-[var(--radius)] p-1 text-body-xs font-medium sm:text-base xl:p-5">
                <span className="hidden lg:block"> Sunday </span>
                <span className="block lg:hidden"> Sun </span>
              </th>
              <th className="flex h-15 items-center justify-center p-1 text-body-xs font-medium sm:text-base xl:p-5">
                <span className="hidden lg:block"> Monday </span>
                <span className="block lg:hidden"> Mon </span>
              </th>
              <th className="flex h-15 items-center justify-center p-1 text-body-xs font-medium sm:text-base xl:p-5">
                <span className="hidden lg:block"> Tuesday </span>
                <span className="block lg:hidden"> Tue </span>
              </th>
              <th className="flex h-15 items-center justify-center p-1 text-body-xs font-medium sm:text-base xl:p-5">
                <span className="hidden lg:block"> Wednesday </span>
                <span className="block lg:hidden"> Wed </span>
              </th>
              <th className="flex h-15 items-center justify-center p-1 text-body-xs font-medium sm:text-base xl:p-5">
                <span className="hidden lg:block"> Thursday </span>
                <span className="block lg:hidden"> Thur </span>
              </th>
              <th className="flex h-15 items-center justify-center p-1 text-body-xs font-medium sm:text-base xl:p-5">
                <span className="hidden lg:block"> Friday </span>
                <span className="block lg:hidden"> Fri </span>
              </th>
              <th className="flex h-15 items-center justify-center rounded-tr-[var(--radius)] p-1 text-body-xs font-medium sm:text-base xl:p-5">
                <span className="hidden lg:block"> Saturday </span>
                <span className="block lg:hidden"> Sat </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {/* <!-- Line 1 --> */}
            <tr className="grid grid-cols-7">
              <td className={cellClass}>
                <span className={dayNumberClass}>1</span>
                <div className="group h-16 w-full flex-grow cursor-pointer py-1 md:h-30">
                  <span className="group-hover:text-[hsl(var(--sidebar-primary))] md:hidden">
                    More
                  </span>
                  <div className="event invisible absolute left-2 z-99 mb-1 flex w-[200%] flex-col rounded-r-[5px] border-l-[3px] border-[hsl(var(--sidebar-primary))] bg-[hsl(var(--muted))] px-3 py-1 text-left opacity-0 group-hover:visible group-hover:opacity-100 dark:bg-[hsl(var(--secondary))] md:visible md:w-[190%] md:opacity-100">
                    <span className="event-name font-medium text-[hsl(var(--foreground))] dark:text-[hsl(var(--card-foreground))]">
                      Redesign Website
                    </span>
                    <span className="time text-sm text-[hsl(var(--muted-foreground))]">1 Dec - 2 Dec</span>
                  </div>
                </div>
              </td>
              <td className={cellClass}>
                <span className={dayNumberClass}>2</span>
              </td>
              <td className={cellClass}>
                <span className={dayNumberClass}>3</span>
              </td>
              <td className={cellClass}>
                <span className={dayNumberClass}>4</span>
              </td>
              <td className={cellClass}>
                <span className={dayNumberClass}>5</span>
              </td>
              <td className={cellClass}>
                <span className={dayNumberClass}>6</span>
              </td>
              <td className={cellClass}>
                <span className={dayNumberClass}>7</span>
              </td>
            </tr>
            {/* <!-- Line 1 --> */}
            {/* <!-- Line 2 --> */}
            <tr className="grid grid-cols-7">
              <td className={cellClass}>
                <span className={dayNumberClass}>8</span>
              </td>
              <td className={cellClass}>
                <span className={dayNumberClass}>9</span>
              </td>
              <td className={cellClass}>
                <span className={dayNumberClass}>10</span>
              </td>
              <td className={cellClass}>
                <span className={dayNumberClass}>11</span>
              </td>
              <td className={cellClass}>
                <span className={dayNumberClass}>12</span>
              </td>
              <td className={cellClass}>
                <span className={dayNumberClass}>13</span>
              </td>
              <td className={cellClass}>
                <span className={dayNumberClass}>14</span>
              </td>
            </tr>
            {/* <!-- Line 2 --> */}
            {/* <!-- Line 3 --> */}
            <tr className="grid grid-cols-7">
              <td className={cellClass}>
                <span className={dayNumberClass}>15</span>
              </td>
              <td className={cellClass}>
                <span className={dayNumberClass}>16</span>
              </td>
              <td className={cellClass}>
                <span className={dayNumberClass}>17</span>
              </td>
              <td className={cellClass}>
                <span className={dayNumberClass}>18</span>
              </td>
              <td className={cellClass}>
                <span className={dayNumberClass}>19</span>
              </td>
              <td className={cellClass}>
                <span className={dayNumberClass}>20</span>
              </td>
              <td className={cellClass}>
                <span className={dayNumberClass}>21</span>
              </td>
            </tr>
            {/* <!-- Line 3 --> */}
            {/* <!-- Line 4 --> */}
            <tr className="grid grid-cols-7">
              <td className={cellClass}>
                <span className={dayNumberClass}>22</span>
              </td>
              <td className={cellClass}>
                <span className={dayNumberClass}>23</span>
              </td>
              <td className={cellClass}>
                <span className={dayNumberClass}>24</span>
              </td>
              <td className={cellClass}>
                <span className={dayNumberClass}>25</span>
                <div className="group h-16 w-full flex-grow cursor-pointer py-1 md:h-30">
                  <span className="group-hover:text-[hsl(var(--sidebar-primary))] md:hidden">
                    More
                  </span>
                  <div className="event invisible absolute left-2 z-99 mb-1 flex w-[300%] flex-col rounded-r-[5px] border-l-[3px] border-[hsl(var(--sidebar-primary))] bg-[hsl(var(--muted))] px-3 py-1 text-left opacity-0 group-hover:visible group-hover:opacity-100 dark:bg-[hsl(var(--secondary))] md:visible md:w-[290%] md:opacity-100">
                    <span className="event-name font-medium text-[hsl(var(--foreground))] dark:text-[hsl(var(--card-foreground))]">
                      App Design
                    </span>
                    <span className="time text-sm text-[hsl(var(--muted-foreground))]">25 Dec - 27 Dec</span>
                  </div>
                </div>
              </td>
              <td className={cellClass}>
                <span className={dayNumberClass}>26</span>
              </td>
              <td className={cellClass}>
                <span className={dayNumberClass}>27</span>
              </td>
              <td className={cellClass}>
                <span className={dayNumberClass}>28</span>
              </td>
            </tr>
            {/* <!-- Line 4 --> */}
            {/* <!-- Line 5 --> */}
            <tr className="grid grid-cols-7">
              <td className={cellClass + " rounded-bl-[var(--radius)]"}>
                <span className={dayNumberClass}>29</span>
              </td>
              <td className={cellClass}>
                <span className={dayNumberClass}>30</span>
              </td>
              <td className={cellClass}>
                <span className={dayNumberClass}>31</span>
              </td>
              <td className={cellClass}>
                <span className={dayNumberClass}>1</span>
              </td>
              <td className={cellClass}>
                <span className={dayNumberClass}>2</span>
              </td>
              <td className={cellClass}>
                <span className={dayNumberClass}>3</span>
              </td>
              <td className={cellClass + " rounded-br-[var(--radius)]"}>
                <span className={dayNumberClass}>4</span>
              </td>
            </tr>
            {/* <!-- Line 5 --> */}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default CalendarBox;