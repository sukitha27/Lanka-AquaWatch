import { Search, X } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DISTRICTS, type District } from "@shared/schema";

interface SearchLocationProps {
  onDistrictSelect: (district: District) => void;
}

export function SearchLocation({ onDistrictSelect }: SearchLocationProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredDistricts = query
    ? DISTRICTS.filter(d => 
        d.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleSelect = (district: District) => {
    onDistrictSelect(district);
    setQuery("");
    setIsOpen(false);
  };

  return (
    <Card className="backdrop-blur-sm bg-card/90 p-2">
      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search districts..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(e.target.value.length > 0);
              }}
              onFocus={() => query && setIsOpen(true)}
              className="pl-8 h-9"
              data-testid="input-search-location"
            />
          </div>
          {query && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setQuery("");
                setIsOpen(false);
              }}
              data-testid="button-clear-search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {isOpen && filteredDistricts.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-popover-border rounded-md shadow-lg z-50 max-h-48 overflow-auto">
            {filteredDistricts.map((district) => (
              <button
                key={district}
                onClick={() => handleSelect(district)}
                className="w-full px-3 py-2 text-left text-sm hover-elevate active-elevate-2"
                data-testid={`option-district-${district}`}
              >
                {district}
              </button>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
