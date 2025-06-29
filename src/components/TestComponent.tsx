import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export default function TestComponent() {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-6 w-6 text-green-500" />
          <span>Test Successful</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          The application is working correctly. This is a test component that confirms everything is set up properly.
        </p>
      </CardContent>
    </Card>
  );
}
