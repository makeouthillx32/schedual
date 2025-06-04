import {
Table,
TableBody,
TableCell,
TableHead,
TableHeader,
TableRow,
} from “@/components/ui/table”;
import { cn } from “@/lib/utils”;
import { Button } from “@/components/ui/button”;
import { Badge } from “@/components/ui/badge”;

// Dummy data for clients
const clientsData = [
{
id: 1,
name: “Sarah Johnson”,
status: “Employed”,
statusColor: “bg-green-100 text-green-800”,
lastContact: “2 days ago”,
nextAppointment: “Tomorrow 2:00 PM”,
phone: “(555) 123-4567”
},
{
id: 2,
name: “Michael Chen”,
status: “Job Searching”,
statusColor: “bg-yellow-100 text-yellow-800”,
lastContact: “1 week ago”,
nextAppointment: “Friday 10:00 AM”,
phone: “(555) 234-5678”
},
{
id: 3,
name: “Emily Rodriguez”,
status: “Training”,
statusColor: “bg-blue-100 text-blue-800”,
lastContact: “3 days ago”,
nextAppointment: “Next Mon 1:00 PM”,
phone: “(555) 345-6789”
},
{
id: 4,
name: “David Thompson”,
status: “Interview Scheduled”,
statusColor: “bg-purple-100 text-purple-800”,
lastContact: “Yesterday”,
nextAppointment: “Today 3:30 PM”,
phone: “(555) 456-7890”
},
{
id: 5,
name: “Lisa Wang”,
status: “Employed”,
statusColor: “bg-green-100 text-green-800”,
lastContact: “5 days ago”,
nextAppointment: “Next Wed 11:00 AM”,
phone: “(555) 567-8901”
},
{
id: 6,
name: “James Wilson”,
status: “Job Searching”,
statusColor: “bg-yellow-100 text-yellow-800”,
lastContact: “4 days ago”,
nextAppointment: “Thursday 9:00 AM”,
phone: “(555) 678-9012”
}
];

export async function ClientsList({ className }: { className?: string }) {
return (
<div
className={cn(
“grid rounded-[var(–radius)] bg-[hsl(var(–background))] px-7.5 pb-4 pt-7.5 shadow-[var(–shadow-sm)] dark:bg-[hsl(var(–card))] dark:shadow-[var(–shadow-md)]”,
className,
)}
>
<h2 className="mb-4 text-body-2xlg font-bold text-[hsl(var(--foreground))] dark:text-[hsl(var(--card-foreground))]">
Your Clients
</h2>

```
  <Table>
    <TableHeader>
      <TableRow className="border-none uppercase [&>th]:text-center">
        <TableHead className="min-w-[120px] !text-left">Client</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Last Contact</TableHead>
        <TableHead>Next Appointment</TableHead>
        <TableHead className="!text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>

    <TableBody>
      {clientsData.map((client) => (
        <TableRow
          className="text-center text-base font-medium text-[hsl(var(--foreground))] dark:text-[hsl(var(--card-foreground))]"
          key={client.id}
        >
          <TableCell className="flex min-w-fit items-center gap-3">
            <div className="size-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold">
              {client.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="text-left">
              <div className="font-medium">{client.name}</div>
              <div className="text-sm text-gray-500">{client.phone}</div>
            </div>
          </TableCell>

          <TableCell>
            <Badge className={client.statusColor} variant="secondary">
              {client.status}
            </Badge>
          </TableCell>

          <TableCell>{client.lastContact}</TableCell>

          <TableCell>{client.nextAppointment}</TableCell>

          <TableCell className="!text-right">
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm">
                Call
              </Button>
              <Button variant="outline" size="sm">
                Message
              </Button>
              <Button variant="outline" size="sm">
                Note
              </Button>
            </div>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</div>
```

);
}