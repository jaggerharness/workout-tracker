'use client';

import { Button, buttonVariants } from '@/components/shad-ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/shad-ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/shad-ui/dialog';
import { Input } from '@/components/shad-ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/shad-ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/shad-ui/table';
import { ExerciseWithMuscleGroups } from '@/lib/types';
import { cn } from '@/lib/utils';
import { workoutFormSchema } from '@/lib/zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import { PlusCircle, Search, Trash2Icon } from 'lucide-react';
import { useRef, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Badge } from '../shad-ui/badge';
import { Calendar } from '../shad-ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../shad-ui/form';
import { ScrollArea } from '../shad-ui/scroll-area';
import { Separator } from '../shad-ui/separator';
import { createWorkout } from '@/server/actions/actions';
import { toast } from '@/components/shad-ui/use-toast';
import { useRouter } from 'next/navigation';

type WorkoutFormValues = z.infer<typeof workoutFormSchema>;

export function CreateWorkoutForm({
  exercises,
}: {
  exercises: ExerciseWithMuscleGroups[];
}) {
  const form = useForm<WorkoutFormValues>({
    resolver: zodResolver(workoutFormSchema),
    defaultValues: {
      name: '',
    },
  });

  const router = useRouter();

  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'workoutExercises',
  });

  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const ref = useRef<HTMLButtonElement | null>(null);

  async function onSubmit(workoutData: any) {
    const res = await createWorkout({ workoutData });
    if(res.type === 'success'){
      setOpen(false);
      router.refresh();
      toast({
        title: 'Workout Created',
        description: `Workout ${workoutData.name} created successfully!`,
        variant: 'success',
      });
      return;
    }
    toast({
      title: 'Error',
      description: `An unexpected error occurred. Please try again later.`,
      variant: 'destructive',
    });
  }

  function addExercise(exercise: ExerciseWithMuscleGroups) {
    const { id, displayName } = exercise;
    append(
      {
        exercise: { id, displayName: displayName ?? '' },
        sets: 3,
        reps: 10,
      },
      { shouldFocus: false },
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={buttonVariants({ variant: 'default' })}>
        Create A Workout
      </DialogTrigger>
      <DialogClose />
      <DialogContent className="w-full sm:max-w-xl p-0">
        <ScrollArea className="max-h-[85vh] p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Create A Workout</DialogTitle>
            <DialogDescription>
              You can create a workout from scratch or use an existing template
            </DialogDescription>
          </DialogHeader>
          <Form {...form} handleSubmit={handleSubmit}>
            <form
              className="mx-4 mt-4 space-y-8"
              onSubmit={handleSubmit(onSubmit)}
            >
              <FormField
                control={control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workout Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Name" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is the name that we will use to reference this
                      workout
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Workout Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-[240px] pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground',
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto size-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="z-50 w-auto p-0" align="start">
                        <Calendar
                          className="pointer-events-auto"
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      We&rsquo;ll use this date to show when you start this
                      workout
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Card>
                <CardHeader>
                  <CardTitle>Exercises</CardTitle>
                  <CardDescription>
                    Select the exercises to include in this workout
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    {fields.length === 0 ? (
                      <TableBody>
                        <TableRow className="pointer-events-none">
                          <TableCell className="text-center text-small text-muted-foreground">
                            No exercises added yet. Add an exercise using the
                            button below.
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    ) : (
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-2/5 sm:w-[200px]">
                            Exercise
                          </TableHead>
                          <TableHead className="sm:w-[200px]">Sets</TableHead>
                          <TableHead className="sm:w-[200px]">Reps</TableHead>
                          <TableHead className=""></TableHead>
                        </TableRow>
                      </TableHeader>
                    )}
                    <TableBody>
                      {fields.map((field, index) => (
                        <TableRow key={field.id}>
                          <TableCell className="font-semibold">
                            {field.exercise.displayName}
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={control}
                              name={`workoutExercises.${index}.sets`}
                              render={() => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min={1}
                                      id={`workoutExercises.${index}.sets`}
                                      {...register(
                                        `workoutExercises.${index}.sets` as const,
                                      )}
                                    />
                                  </FormControl>
                                  <FormMessage>
                                    {errors.workoutExercises?.[index]?.sets && (
                                      <p>
                                        {
                                          errors.workoutExercises[index].sets
                                            .message
                                        }
                                      </p>
                                    )}
                                  </FormMessage>
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={control}
                              name={`workoutExercises.${index}.reps`}
                              render={() => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min={1}
                                      id={`workoutExercises.${index}.reps`}
                                      {...register(
                                        `workoutExercises.${index}.reps` as const,
                                      )}
                                    />
                                  </FormControl>
                                  <FormMessage>
                                    {errors.workoutExercises?.[index]?.reps && (
                                      <p>
                                        {
                                          errors.workoutExercises[index].reps
                                            .message
                                        }
                                      </p>
                                    )}
                                  </FormMessage>
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              onClick={() => remove(index)}
                              variant={'destructive'}
                            >
                              <Trash2Icon className="size-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter className="justify-center border-t p-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="ghost" className="gap-1">
                        <PlusCircle className="size-3.5" />
                        Add Exercise
                      </Button>
                    </DialogTrigger>
                    <DialogClose ref={ref} />
                    <DialogContent className="h-[85vh] sm:h-3/4">
                      <DialogHeader>
                        <DialogTitle>Select Exercise</DialogTitle>
                        <DialogDescription>
                          Select the exercise you want to add to this workout.
                        </DialogDescription>
                      </DialogHeader>
                      <Separator />
                      <div className="bg-background/95 mx-4 my-2 supports-[backdrop-filter]:bg-background/60">
                        <form>
                          <div className="relative">
                            <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
                            <Input placeholder="Search" className="pl-8" />
                          </div>
                        </form>
                      </div>
                      <ScrollArea className="h-full">
                        {exercises.map((exercise) => (
                          <div
                            key={exercise.id}
                            className="flex flex-col gap-2 p-4 pt-0"
                          >
                            <button
                              key={exercise.id}
                              className={cn(
                                'flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent',
                                exercise.id === selectedId &&
                                  'bg-muted border-primary',
                              )}
                              onClick={() => setSelectedId(exercise.id)}
                              onDoubleClick={() => {
                                setSelectedId(exercise.id);

                                const selectedExercise =
                                  exercises.find(
                                    (element) => element.id === selectedId,
                                  ) ?? null;

                                if (selectedExercise) {
                                  addExercise(selectedExercise);
                                }

                                ref.current?.click();
                                setSelectedId(null);
                              }}
                            >
                              <div className="flex w-full flex-col gap-1">
                                <div className="flex items-center">
                                  <div className="flex items-center gap-2">
                                    <div className="font-semibold">
                                      {exercise.displayName}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="line-clamp-2 text-xs text-muted-foreground">
                                {exercise.description}
                              </div>
                              <div className="flex items-center gap-2">
                                {exercise.muscleGroups.map((muscleGroup) => {
                                  return (
                                    <Badge
                                      key={muscleGroup.id}
                                      variant={'secondary'}
                                    >
                                      {muscleGroup.name}
                                    </Badge>
                                  );
                                })}
                              </div>
                            </button>
                          </div>
                        ))}
                      </ScrollArea>
                      <DialogFooter>
                        <Button
                          type="button"
                          onClick={() => {
                            const selectedExercise =
                              exercises.find(
                                (element) => element.id === selectedId,
                              ) ?? null;

                            if (selectedExercise) {
                              addExercise(selectedExercise);
                            }

                            ref.current?.click();
                            setSelectedId(null);
                          }}
                        >
                          Add
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
              <Button
                className="w-1/2 flex mx-auto"
                type="submit"
                variant={'default'}
              >
                Create Workout
              </Button>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
