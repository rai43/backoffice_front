const parcelsUtils = {
  /**
   * Finds the ongoing assignment for a given colis object based on the matching status_id.
   * The function iterates through the colis_assignment array and identifies the assignment
   * whose colis_status_id matches the status_id in the main colis object. This indicates
   * the currently active or ongoing assignment.
   *
   * @param {Object} colis - The colis object containing the assignments and main status_id.
   * @param {Array} colis.colis_assignment - Array of assignment objects for the colis.
   * @param {number} colis.status_id - The current status identifier of the colis.
   * @returns {Object|null} The ongoing assignment object if a matching colis_status_id is found; otherwise, null.
   */
  findOngoingAssignment: (colis) => {
    // noinspection JSUnresolvedReference
    const ongoingAssignment = colis?.colis_assignment?.find(
      (assignment) => assignment.colis_status_id === colis.status_id
    );

    return ongoingAssignment || null;
  },
  /**
   * Finds an assignment of type "PICKUP" with the status "COLLECTED".
   *
   * @param {Array} assignments - An array of assignment objects.
   * @returns {Object|undefined} - The first found assignment object of type "PICKUP" with the status "COLLECTED", or `undefined` if no such assignment exists.
   */
  findCollectedPickupAssignment: (assignments) => {
    return assignments.find(
      (assignment) => assignment.type === 'PICKUP' && assignment.status === 'COLLECTED'
    );
  },

  /**
   * Processes a list of assignments to determine the most relevant assignment for PICKUP, DELIVERY, and RETURN types.
   * It prioritizes assignments that are either ongoing (status_id is null) or have reached a successful status.
   * Within each type, assignments are further prioritized based on specific success codes and by their IDs for recency.
   *
   * @param {Array} assignments - The array of assignment objects to process.
   * @returns {Object} An object containing the most relevant assignment for each of PICKUP, DELIVERY, and RETURN types.
   */
  processAssignments: (assignments) => {
    /**
     * Prioritizes assignments based on success status codes, ongoing status, and recency.
     *
     * @param {Array} filteredAssignments - The assignments filtered by a specific type.
     * @param {Array<string>} successCodes - An array of status codes considered as successful for the assignment type.
     * @returns {Object|null} The highest-priority assignment based on the criteria, or null if none match.
     */
    const prioritizeAssignments = (filteredAssignments, successCodes) => {
      // First, try to find assignments that are ongoing or have a success status
      let priorityAssignments = filteredAssignments.filter(
        (a) => successCodes.includes(a.status?.colis_status?.code) || a.status_id === null
      );

      // If no assignments are ongoing, consider all assignments regardless of status_id
      if (priorityAssignments.length === 0) {
        priorityAssignments = filteredAssignments;
      }

      return priorityAssignments.sort((a, b) => {
        // Prioritize by successCodes, then by non-null status_id, then by recency
        const codePriorityA = successCodes.includes(a.status?.colis_status?.code) ? 1 : 0;
        const codePriorityB = successCodes.includes(b.status?.colis_status?.code) ? 1 : 0;
        const statusPriorityA = a.status_id !== null ? 1 : 0; // Change to consider non-null status_id
        const statusPriorityB = b.status_id !== null ? 1 : 0; // Change to consider non-null status_id
        const idComparison = b.id - a.id; // Latest id first

        return codePriorityB - codePriorityA || statusPriorityB - statusPriorityA || idComparison;
      })[0]; // Return the highest-priority assignment
    };
    // const prioritizeAssignments = (filteredAssignments, successCodes) => {
    //   return filteredAssignments
    //     .filter((a) => a.status_id === null || successCodes.includes(a.status?.colis_status?.code))
    //     .sort((a, b) => {
    //       const codePriorityA = successCodes.includes(a.status?.colis_status?.code) ? 1 : 0;
    //       const codePriorityB = successCodes.includes(b.status?.colis_status?.code) ? 1 : 0;
    //       const statusPriorityA = a.status_id === null ? 1 : 0;
    //       const statusPriorityB = b.status_id === null ? 1 : 0;
    //       const idComparison = b.id - a.id; // Latest id first

    //       return codePriorityB - codePriorityA || statusPriorityB - statusPriorityA || idComparison;
    //     })[0]; // Return the highest-priority assignment
    // };

    // Define success codes for each type
    const successCodes = {
      PICKUP: ['COLLECTED'],
      DELIVERY: ['DELIVERED', 'POSTPONED', 'REFUSED', 'ARTICLE_TO_RETURN'],
      RETURN: ['RETURNED']
    };

    // Process assignments for each type
    // noinspection UnnecessaryLocalVariableJS
    const result = {
      PICKUP: prioritizeAssignments(
        assignments.filter((a) => a.type === 'PICKUP'),
        successCodes.PICKUP
      ),
      DELIVERY: prioritizeAssignments(
        assignments.filter((a) => a.type === 'DELIVERY'),
        successCodes.DELIVERY
      ),
      RETURN: prioritizeAssignments(
        assignments.filter((a) => a.type === 'RETURN'),
        successCodes.RETURN
      )
    };

    return result;
  }
};

export default parcelsUtils;
