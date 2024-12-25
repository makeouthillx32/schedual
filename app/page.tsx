import Hero from "@/components/hero";
import ConnectSupabaseSteps from "@/components/tutorial/connect-supabase-steps";
import SignUpUserSteps from "@/components/tutorial/sign-up-user-steps";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Define types for query results
interface Business {
  id: number;
  business_name: string;
}

interface ScheduleResult {
  business_id: number;
  Businesses: Business; // Expect a single `Business`, not an array
}

export default function Home() {
  const [week, setWeek] = useState("1");
  const [day, setDay] = useState("monday");
  const [results, setResults] = useState<ScheduleResult[]>([]);

  const fetchSchedule = async () => {
    try {
      const { data, error } = await supabase
        .from("Schedule")
        .select("business_id, Businesses!inner(id, business_name)") // Use `!inner` to enforce a single result
        .eq("week", week)
        .eq(day, true);

      if (error) {
        console.error("Error fetching schedule:", error.message);
        setResults([]);
        return;
      }

      if (data && data.length > 0) {
        setResults(data as ScheduleResult[]); // Type assertion for TypeScript
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error("Error fetching schedule:", error);
      setResults([]);
    }
  };

  return (
    <>
      <Hero />
      <main className="flex-1 flex flex-col gap-6 px-4">
        <h2 className="font-medium text-xl mb-4">Next steps</h2>
        {hasEnvVars ? <SignUpUserSteps /> : <ConnectSupabaseSteps />}

        {/* Fetch schedule */}
        <section>
          <h3 className="text-lg font-medium mb-2">Cleaning Schedule</h3>
          <div className="flex flex-col gap-2">
            <label>
              Week:
              <select value={week} onChange={(e) => setWeek(e.target.value)}>
                <option value="1">Week 1</option>
                <option value="2">Week 2</option>
                <option value="3">Week 3</option>
                <option value="4">Week 4</option>
              </select>
            </label>
            <label>
              Day:
              <select value={day} onChange={(e) => setDay(e.target.value)}>
                <option value="monday">Monday</option>
                <option value="tuesday">Tuesday</option>
                <option value="wednesday">Wednesday</option>
                <option value="thursday">Thursday</option>
                <option value="friday">Friday</option>
              </select>
            </label>
            <button
              className="bg-blue-500 text-white py-2 px-4 rounded mt-2"
              onClick={fetchSchedule}
            >
              Get Schedule
            </button>
          </div>

          {/* Results */}
          <ul className="mt-4">
            {results.length > 0 ? (
              results.map((result) => (
                <li key={result.business_id} className="text-gray-700">
                  {result.Businesses.business_name}
                </li>
              ))
            ) : (
              <li>No results found</li>
            )}
          </ul>
        </section>
      </main>
    </>
  );
}
