"use strict";
/**
 * This function compares the logging configuration from oldProps and newProps and returns
 * the result that contains LogSetup with enabled:false if any.
 *
 * @param oldProps old properties
 * @param newProps new properties
 * @returns result with LogSet with enabled:false if any
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareLoggingProps = void 0;
function compareLoggingProps(oldProps, newProps) {
    const result = { logging: {} };
    let enabledTypes = [];
    let disabledTypes = [];
    if (newProps.logging?.clusterLogging === undefined && oldProps.logging?.clusterLogging === undefined) {
        return newProps;
    }
    // if newProps containes LogSetup
    if (newProps.logging && newProps.logging.clusterLogging && newProps.logging.clusterLogging.length > 0) {
        enabledTypes = newProps.logging.clusterLogging[0].types;
        // if oldProps contains LogSetup with enabled:true
        if (oldProps.logging && oldProps.logging.clusterLogging && oldProps.logging.clusterLogging.length > 0) {
            // LogType in oldProp but not in newProp should be considered disabled(enabled:false)
            disabledTypes = oldProps.logging.clusterLogging[0].types.filter(t => !newProps.logging.clusterLogging[0].types.includes(t));
        }
    }
    else {
        // all enabled:true in oldProps will be enabled:false
        disabledTypes = oldProps.logging.clusterLogging[0].types;
    }
    if (enabledTypes.length > 0 || disabledTypes.length > 0) {
        result.logging = { clusterLogging: [] };
    }
    // append the enabled:false LogSetup to the result
    if (enabledTypes.length > 0) {
        result.logging.clusterLogging.push({ types: enabledTypes, enabled: true });
    }
    // append the enabled:false LogSetup to the result
    if (disabledTypes.length > 0) {
        result.logging.clusterLogging.push({ types: disabledTypes, enabled: false });
    }
    return result;
}
exports.compareLoggingProps = compareLoggingProps;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGFyZUxvZ2dpbmcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjb21wYXJlTG9nZ2luZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7R0FPRzs7O0FBRUgsU0FBZ0IsbUJBQW1CLENBQUMsUUFBK0MsRUFDakYsUUFBK0M7SUFDL0MsTUFBTSxNQUFNLEdBQTBDLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxDQUFDO0lBQ3RFLElBQUksWUFBWSxHQUFzQixFQUFFLENBQUM7SUFDekMsSUFBSSxhQUFhLEdBQXNCLEVBQUUsQ0FBQztJQUUxQyxJQUFJLFFBQVEsQ0FBQyxPQUFPLEVBQUUsY0FBYyxLQUFLLFNBQVMsSUFBSSxRQUFRLENBQUMsT0FBTyxFQUFFLGNBQWMsS0FBSyxTQUFTLEVBQUU7UUFDcEcsT0FBTyxRQUFRLENBQUM7S0FDakI7SUFDRCxpQ0FBaUM7SUFDakMsSUFBSSxRQUFRLENBQUMsT0FBTyxJQUFJLFFBQVEsQ0FBQyxPQUFPLENBQUMsY0FBYyxJQUFJLFFBQVEsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFDckcsWUFBWSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQU0sQ0FBQztRQUN6RCxrREFBa0Q7UUFDbEQsSUFBSSxRQUFRLENBQUMsT0FBTyxJQUFJLFFBQVEsQ0FBQyxPQUFPLENBQUMsY0FBYyxJQUFJLFFBQVEsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDckcscUZBQXFGO1lBQ3JGLGFBQWEsR0FBRyxRQUFRLENBQUMsT0FBUSxDQUFDLGNBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBUSxDQUFDLGNBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDbkk7S0FDRjtTQUFNO1FBQ0wscURBQXFEO1FBQ3JELGFBQWEsR0FBRyxRQUFRLENBQUMsT0FBUSxDQUFDLGNBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFNLENBQUM7S0FDN0Q7SUFFRCxJQUFJLFlBQVksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLGFBQWEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1FBQ3ZELE1BQU0sQ0FBQyxPQUFPLEdBQUcsRUFBRSxjQUFjLEVBQUUsRUFBRSxFQUFFLENBQUM7S0FDekM7SUFFRCxrREFBa0Q7SUFDbEQsSUFBSSxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtRQUMzQixNQUFNLENBQUMsT0FBUSxDQUFDLGNBQWUsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0tBQzlFO0lBQ0Qsa0RBQWtEO0lBQ2xELElBQUksYUFBYSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFDNUIsTUFBTSxDQUFDLE9BQVEsQ0FBQyxjQUFlLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLGFBQWEsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztLQUNoRjtJQUNELE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUM7QUFuQ0Qsa0RBbUNDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIGNvbXBhcmVzIHRoZSBsb2dnaW5nIGNvbmZpZ3VyYXRpb24gZnJvbSBvbGRQcm9wcyBhbmQgbmV3UHJvcHMgYW5kIHJldHVybnNcbiAqIHRoZSByZXN1bHQgdGhhdCBjb250YWlucyBMb2dTZXR1cCB3aXRoIGVuYWJsZWQ6ZmFsc2UgaWYgYW55LlxuICpcbiAqIEBwYXJhbSBvbGRQcm9wcyBvbGQgcHJvcGVydGllc1xuICogQHBhcmFtIG5ld1Byb3BzIG5ldyBwcm9wZXJ0aWVzXG4gKiBAcmV0dXJucyByZXN1bHQgd2l0aCBMb2dTZXQgd2l0aCBlbmFibGVkOmZhbHNlIGlmIGFueVxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBjb21wYXJlTG9nZ2luZ1Byb3BzKG9sZFByb3BzOiBQYXJ0aWFsPEFXUy5FS1MuQ3JlYXRlQ2x1c3RlclJlcXVlc3Q+LFxuICBuZXdQcm9wczogUGFydGlhbDxBV1MuRUtTLkNyZWF0ZUNsdXN0ZXJSZXF1ZXN0Pik6IFBhcnRpYWw8QVdTLkVLUy5DcmVhdGVDbHVzdGVyUmVxdWVzdD4ge1xuICBjb25zdCByZXN1bHQ6IFBhcnRpYWw8QVdTLkVLUy5DcmVhdGVDbHVzdGVyUmVxdWVzdD4gPSB7IGxvZ2dpbmc6IHt9IH07XG4gIGxldCBlbmFibGVkVHlwZXM6IEFXUy5FS1MuTG9nVHlwZVtdID0gW107XG4gIGxldCBkaXNhYmxlZFR5cGVzOiBBV1MuRUtTLkxvZ1R5cGVbXSA9IFtdO1xuXG4gIGlmIChuZXdQcm9wcy5sb2dnaW5nPy5jbHVzdGVyTG9nZ2luZyA9PT0gdW5kZWZpbmVkICYmIG9sZFByb3BzLmxvZ2dpbmc/LmNsdXN0ZXJMb2dnaW5nID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gbmV3UHJvcHM7XG4gIH1cbiAgLy8gaWYgbmV3UHJvcHMgY29udGFpbmVzIExvZ1NldHVwXG4gIGlmIChuZXdQcm9wcy5sb2dnaW5nICYmIG5ld1Byb3BzLmxvZ2dpbmcuY2x1c3RlckxvZ2dpbmcgJiYgbmV3UHJvcHMubG9nZ2luZy5jbHVzdGVyTG9nZ2luZy5sZW5ndGggPiAwKSB7XG4gICAgZW5hYmxlZFR5cGVzID0gbmV3UHJvcHMubG9nZ2luZy5jbHVzdGVyTG9nZ2luZ1swXS50eXBlcyE7XG4gICAgLy8gaWYgb2xkUHJvcHMgY29udGFpbnMgTG9nU2V0dXAgd2l0aCBlbmFibGVkOnRydWVcbiAgICBpZiAob2xkUHJvcHMubG9nZ2luZyAmJiBvbGRQcm9wcy5sb2dnaW5nLmNsdXN0ZXJMb2dnaW5nICYmIG9sZFByb3BzLmxvZ2dpbmcuY2x1c3RlckxvZ2dpbmcubGVuZ3RoID4gMCkge1xuICAgICAgLy8gTG9nVHlwZSBpbiBvbGRQcm9wIGJ1dCBub3QgaW4gbmV3UHJvcCBzaG91bGQgYmUgY29uc2lkZXJlZCBkaXNhYmxlZChlbmFibGVkOmZhbHNlKVxuICAgICAgZGlzYWJsZWRUeXBlcyA9IG9sZFByb3BzLmxvZ2dpbmchLmNsdXN0ZXJMb2dnaW5nIVswXS50eXBlcyEuZmlsdGVyKHQgPT4gIW5ld1Byb3BzLmxvZ2dpbmchLmNsdXN0ZXJMb2dnaW5nIVswXS50eXBlcyEuaW5jbHVkZXModCkpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBhbGwgZW5hYmxlZDp0cnVlIGluIG9sZFByb3BzIHdpbGwgYmUgZW5hYmxlZDpmYWxzZVxuICAgIGRpc2FibGVkVHlwZXMgPSBvbGRQcm9wcy5sb2dnaW5nIS5jbHVzdGVyTG9nZ2luZyFbMF0udHlwZXMhO1xuICB9XG5cbiAgaWYgKGVuYWJsZWRUeXBlcy5sZW5ndGggPiAwIHx8IGRpc2FibGVkVHlwZXMubGVuZ3RoID4gMCkge1xuICAgIHJlc3VsdC5sb2dnaW5nID0geyBjbHVzdGVyTG9nZ2luZzogW10gfTtcbiAgfVxuXG4gIC8vIGFwcGVuZCB0aGUgZW5hYmxlZDpmYWxzZSBMb2dTZXR1cCB0byB0aGUgcmVzdWx0XG4gIGlmIChlbmFibGVkVHlwZXMubGVuZ3RoID4gMCkge1xuICAgIHJlc3VsdC5sb2dnaW5nIS5jbHVzdGVyTG9nZ2luZyEucHVzaCh7IHR5cGVzOiBlbmFibGVkVHlwZXMsIGVuYWJsZWQ6IHRydWUgfSk7XG4gIH1cbiAgLy8gYXBwZW5kIHRoZSBlbmFibGVkOmZhbHNlIExvZ1NldHVwIHRvIHRoZSByZXN1bHRcbiAgaWYgKGRpc2FibGVkVHlwZXMubGVuZ3RoID4gMCkge1xuICAgIHJlc3VsdC5sb2dnaW5nIS5jbHVzdGVyTG9nZ2luZyEucHVzaCh7IHR5cGVzOiBkaXNhYmxlZFR5cGVzLCBlbmFibGVkOiBmYWxzZSB9KTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuIl19