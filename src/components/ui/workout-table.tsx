'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shad-ui/tabs';
import {
  DropdownMenu, DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel, DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/shad-ui/dropdown-menu';
import { Button } from '@/components/shad-ui/button';
import { ListFilter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shad-ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/shad-ui/table';
import { Badge } from '@/components/shad-ui/badge';
import { WorkoutWithExercises } from '@/lib/types';

export function WorkoutTable({ workouts }: { workouts: WorkoutWithExercises[] }) {
  return (
    <Tabs defaultValue="week">
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
          <TabsTrigger value="year">Year</TabsTrigger>
        </TabsList>
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1 text-sm"
              >
                <ListFilter className="size-3.5" />
                <span className="sr-only sm:not-sr-only">Filter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked>
                Upcoming
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>
                Completed
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Skipped</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <TabsContent value="week">
        <Card>
          <CardHeader className="px-7">
            <CardTitle>Workouts</CardTitle>
            <CardDescription>Workouts for the week</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Estimated Time
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Status
                  </TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <div className="font-medium">Chest / Arms</div>
                    <div className="hidden text-sm text-muted-foreground md:inline">
                      Bulking
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    35 - 45 mins
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge className="text-xs" variant="outline">
                      Upcoming
                    </Badge>
                  </TableCell>
                  <TableCell>07/22/2024</TableCell>
                </TableRow>
                {workouts.map((workout) => (
                  <TableRow key={workout.id}>
                    <TableCell>
                      <div className="font-medium">{workout.name}</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {workout.workoutExercises.length * 5} mins
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge className="text-xs" variant="outline">
                        {workout.workoutDate.getDate() < new Date().setHours(0, 0, 0, 0) ? 'Upcoming' : 'Completed'}
                      </Badge>
                    </TableCell>
                    <TableCell>{workout.workoutDate.toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}