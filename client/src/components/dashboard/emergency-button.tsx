import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmergencyButton() {
  return (
    <Button
      variant="destructive"
      size="lg"
      data-testid="button-emergency-report"
      className="gap-2 font-semibold shadow-lg"
      asChild
    >
      <a 
        href="https://floodsupport.org/report" 
        target="_blank" 
        rel="noopener noreferrer"
      >
        <Phone className="h-4 w-4" />
        <span>Report Emergency</span>
      </a>
    </Button>
  );
}
