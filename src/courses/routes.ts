import * as Hapi from "hapi";
import * as Joi from "joi";
import { IServerConfigurations } from "../configurations";
import * as Boom from "boom";

import CourseController from "./course-controller";
import { courseSchema, facilitatingCourseSchema, enrolledCourseSchema, exerciseSchema } from "./schemas";

export default function (server: Hapi.Server, serverConfigs: IServerConfigurations, database: any) {

    const courseController = new CourseController(serverConfigs, database);
    server.bind(courseController);

    server.route({
        method: 'GET',
        path: '/courses',
        config: {
            description: 'List of courses under 3 categories: \
                          1. User has enrolled in. \
                          2. User is facilitating. \
                          3. All courses (includes courses from 1 and 2.)',
            response: {
                schema: Joi.object({
                    "facilitatingCourses": Joi.array().items(facilitatingCourseSchema),
                    "enrolledCourses": Joi.array().items(enrolledCourseSchema),
                    "availableCourses": Joi.array().items(courseSchema)
                })
            },
            auth: 'jwt',
            tags: ['api'],
            handler: courseController.getCoursesList
        }
    });

    server.route({
        method: 'GET',
        path: '/courses/{courseId}/exercises',
        config: {
            description: 'Get complete list of exercises in the course',
            validate: {
                params: {
                    courseId: Joi.number().required()
                }
            },
            response: {
                schema: Joi.object({
                    "data": Joi.array().items(exerciseSchema)
                })
            },
            auth: 'jwt',
            tags: ['api'],
            handler: courseController.getCourseExercises
        }
    });

    // server.route({
    //     method: 'GET',
    //     path: '/courses/{courseId}/exercise/{exerciseId}',
    //     config: {
    //         description: 'Get complete details of the exercise with the given ID. Does not return child exercises.',
    //         validate: {
    //             params: {
    //                 courseId: Joi.number(),
    //                 exerciseId : Joi.number()
    //             }
    //         },
    //         response: {
    //             schema: exerciseSchema
    //         },
    //         auth: 'jwt',
    //         tags: ['api'],
    //         handler: courseController.getExerciseById
    //     }
    // });

    server.route({
        method: 'GET',
        path: '/courses/{courseId}/exercise/getBySlug',
        config: {
            description: 'Get complete details of the exercise with the given slug. Does not return child exercises.',
            validate: {
                params: {
                    courseId: Joi.number(),
                },
                query: {
                    slug: Joi.string().description('write exercise slug here')
                }
            },
            // response: {
            //     schema: exerciseSchema
            // },
            auth: 'jwt',
            tags: ['api'],
            handler: courseController.getExerciseBySlug
        }
    });

    server.route({
        method: 'GET',
        path: '/courses/{courseId}/notes',
        config: {
            description: 'Get any additional notes attached with the course.',
            validate: {
                params: {
                    courseId: Joi.number()
                }
            },
            response: {
                schema: Joi.object({
                    "notes": Joi.string()
                             .default("# Notes Title ## Not sub-title Some content. \n More.")
                             .description("Notes in markdown.")
                })
            },
            auth: 'jwt',
            tags: ['api'],
            handler: courseController.getCourseNotes
        }
    });

    server.route({
        method: 'POST',
        path: '/courses/{courseId}/enroll',
        config: {
            description: 'Enroll in the course with the given ID.',
            validate: {
                params: {
                    courseId: Joi.number()
                }
            },
            response: {
                schema: {
                    "enrolled": Joi.bool()
                }
            },
            auth: 'jwt',
            tags: ['api'],
            handler: courseController.enrollInCourse
        }
    });

}
