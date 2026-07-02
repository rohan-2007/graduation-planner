import { BACKEND_BASE_URL } from "@/config/api";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { semesterPlan } from "../../../server/src/services/graduationPlanner/scheduler";
import { useAuth } from "../auth/AuthContext";

export default function Plan() {
  const { user } = useAuth();

  const [plan, setPlan] = useState<semesterPlan[]>([]);

  useEffect(() => {
    const fetchPlan = async () => {
      if (!user) return;
      console.log("USER''''''': ", user.id);
      const response = await fetch(`${BACKEND_BASE_URL}/plan`, {
        body: JSON.stringify({
          userId: user.id,
          maxCreditsPerSemester: 15,
          numberOfSemestersLeft: 4,
        }),
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const resJson = await response.json();

      setPlan(resJson.plan);
    };

    fetchPlan();
  }, [user]);

  return (
    <>
      <View style={styles.outerDiv}>
        <Text style={styles.heading}>Graduation Plan</Text>

        {plan.map((semesterPlan) => (
          <View style={styles.semesterDiv}>
            <Text>Semester {semesterPlan.semester}</Text>
            <View style={styles.coursesBlock}>
              {semesterPlan.courses.map((course) => (
                <Text>{course.code}</Text>
              ))}
            </View>
          </View>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  outerDiv: {
    padding: "2%",
  },
  heading: {
    fontWeight: "bold",
  },
  semesterDiv: {
    marginTop: "2%",
  },
  coursesBlock: {
    margin: "1%",
  },
});
