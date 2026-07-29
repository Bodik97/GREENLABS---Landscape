import { blockTypes } from './blocks'
import { teamMember } from './teamMember'
import { project } from './project'
import { post } from './post'

export const schemaTypes = [project, post, teamMember, ...blockTypes]
